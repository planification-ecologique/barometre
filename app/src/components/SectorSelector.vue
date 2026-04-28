<template>
  <div class="sector-selector-container">
    <div class="fr-select-group">
      <label class="fr-label" for="sector-select">
        Navigation
      </label>
      <div class="sector-select-wrapper">
        <!-- Sector icon -->
        <div class="sector-icon-wrapper" v-if="currentSectorIcon">
          <component
            :is="currentSectorIcon"
            :width="iconSize"
            :height="iconSize"
            class="sector-icon"
          />
        </div>
        <select
          id="sector-select"
          class="fr-select"
          :class="{ 'with-icon': currentSectorIcon }"
          :value="currentValue"
          @change="handleChange"
          aria-label="Sélectionner une page"
        >
          <!-- Sectors -->
          <optgroup label="Secteurs">
            <option
              v-for="sector in sectors"
              :key="sector"
              :value="'sector:' + sector"
            >
              {{ sector }}
            </option>
          </optgroup>
          
          <!-- Synthèse sub-navigation - matches SideNavigation structure -->
          <template v-if="activeSector === 'Synthèse'">
            <optgroup label="Accueil">
              <option value="view:about">À propos</option>
            </optgroup>
            <optgroup label="État de l'environnement">
              <option value="view:etat-environnement">Synthèse</option>
              <option v-for="axe in displayedTaxonomyAxes" :key="'axe-' + axe" :value="'axe:' + axe">
                {{ axe }}
              </option>
            </optgroup>
            <optgroup label="Chantiers sectoriels">
              <option value="view:chantiers-sectoriels">Synthèse</option>
              <option
                v-for="chantier in allChantiersFlat"
                :key="'chantier-' + chantier.sector + '-' + chantier.id"
                :value="'chantierSynthese:' + chantier.id + ':' + chantier.sector"
              >
                {{ chantier.sector }} — {{ chantier.name }}
              </option>
            </optgroup>
          </template>
          
          <!-- Sectorial sub-navigation (only shown when on a non-Synthèse sector) -->
          <optgroup v-if="activeSector && activeSector !== 'Synthèse'" :label="'Navigation ' + activeSector">
            <option value="view:sectorial-engagements">Indicateurs d'impact</option>
            <option v-for="chantier in chantiers" :key="'chantier-' + chantier.id" :value="'chantier:' + chantier.id">
              {{ chantier.name }}
            </option>
          </optgroup>
          
          <!-- Other pages -->
          <optgroup label="Autres">
            <option value="page:search">Recherche</option>
          </optgroup>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
import router from '../router'
import {
  homeRouteName,
  dashboardRouteName,
  etatEnvironnementRouteName,
  chantiersRouteName,
  rechercheRouteName,
} from '@/config/routeNames.js'
import {
  resolveSectorFromQuery,
  toSectionSlug,
  SECTION_SYNTHESE_SLUG,
} from '@/utils/sectionUrl.js'
import { impactAxeNameToSlug, impactAxeSlugToName, isImpactAxeSlug } from '@/utils/impactAxeUrl.js'
import { getNavigationStructure, IMPACT_AXE_DISPLAY_ORDER, isImpactAxe } from '@/services/csvDataService.js'
import { getSectorIcon } from '@/utils/sectorIcons.js'

export default {
  name: 'SectorSelector',
  props: {
    currentSector: {
      type: String,
      default: 'Synthèse'
    }
  },
  data() {
    return {
      sectors: ['Synthèse'], // Default, will be loaded from Grist data
      iconSize: '32px',
      navigationData: null,
      taxonomyAxes: [],
      chantierSectors: [],
      chantiers: [],
      allSectorChantiers: {}
    }
  },
  computed: {
    currentSectorIcon() {
      return getSectorIcon(this.activeSector)
    },
    // Use route-based sector to ensure consistency with currentValue
    activeSector() {
      return (
        resolveSectorFromQuery(this.$route?.query || {}, this.sectors) ||
        this.currentSector ||
        'Synthèse'
      )
    },
    // Match SideNavigation: axes in display order, filter by data, always include Adaptation climat
    displayedTaxonomyAxes() {
      const axes = Array.isArray(this.taxonomyAxes) ? [...this.taxonomyAxes] : []
      const axesSet = new Set(axes)
      return IMPACT_AXE_DISPLAY_ORDER.filter(axe =>
        axesSet.has(axe) ||
        (axe === 'Économie circulaire' && axesSet.has('Economie circulaire')) ||
        axe === 'Adaptation climat'
      )
    },
    // Flat list of chantiers for Synthèse dropdown: { id, name, sector }
    allChantiersFlat() {
      const result = []
      this.chantierSectors.forEach(sectorName => {
        const list = this.allSectorChantiers[sectorName] || []
        list.forEach(c => result.push({ id: c.id, name: c.name, sector: sectorName }))
      })
      return result
    },
    currentValue() {
      // Determine current value based on route
      const query = this.$route?.query || {}
      const path = this.$route?.path || ''
      
      if (path.includes('recherche')) {
        return 'page:search'
      }

      const routeName = this.$route?.name
      if (routeName === 'home' || routeName === 'staging-home') {
        return 'view:about'
      }

      let view = query.view
      if (routeName === 'etat-environnement' || routeName === 'staging-etat-environnement') {
        const secSlug = String(query.section || '').toLowerCase()
        if (secSlug && secSlug !== SECTION_SYNTHESE_SLUG && isImpactAxeSlug(secSlug)) {
          const axeName = impactAxeSlugToName(secSlug)
          if (axeName) return 'axe:' + axeName
        }
        if (!view) view = 'etat-environnement'
      } else if (routeName === 'chantiers' || routeName === 'staging-chantiers') {
        const chSlug = String(query.section || '').toLowerCase()
        if (
          query.chantier_id &&
          chSlug &&
          chSlug !== SECTION_SYNTHESE_SLUG &&
          (!view || view === 'chantier')
        ) {
          view = 'chantier'
        } else if (!view) {
          view = 'chantiers-sectoriels'
        }
      }

      const sector = resolveSectorFromQuery(query, this.sectors)
      
      if (view === 'about') {
        return 'view:about'
      } else if (view === 'etat-environnement') {
        return 'view:etat-environnement'
      } else if (view === 'chantiers-sectoriels' || view === 'chantiers-table') {
        return 'view:chantiers-sectoriels'
      } else if (view === 'general-engagements' && query.axe) {
        return 'axe:' + query.axe
      } else if (view === 'general-chantiers') {
        // Pas d’entrée dédiée dans la liste : même zone que la synthèse chantiers (accès via l’accueil ou URL)
        return 'view:chantiers-sectoriels'
      } else if (view === 'chantier' && query.chantier_id) {
        if (sector === 'Synthèse' && query.chantier_sector) {
          return 'chantierSynthese:' + query.chantier_id + ':' + query.chantier_sector
        }
        return 'chantier:' + query.chantier_id
      } else if (view === 'sectorial-engagements') {
        return 'view:sectorial-engagements'
      }
      
      // Default to sector
      return 'sector:' + sector
    }
  },
  mounted() {
    this.loadNavigation()
  },
  watch: {
    // Watch the computed activeSector which reads from route
    activeSector: {
      handler() {
        this.loadSectorNavigation()
      },
      immediate: true // Run immediately to load correct sector on mount
    }
  },
  methods: {
    async loadNavigation() {
      try {
        // Load navigation structure from Grist data
        const response = await getNavigationStructure('production')
        if (response.status === 'success') {
          this.navigationData = response.data
          this.sectors = response.data.sectorNames || ['Synthèse']
          this.loadSectorNavigation()
        }
      } catch (error) {
        console.error('Error loading navigation:', error)
      }
    },
    loadSectorNavigation() {
      if (!this.navigationData) return
      
      const sector = this.activeSector
      const sectorData = this.navigationData.sectors.find(s => s.name === sector)
      
      if (sector === 'Synthèse') {
        // Load taxonomy axes (raw keys from data; displayedTaxonomyAxes applies display order)
        const syntheseSector = this.navigationData.sectors.find(s => s.name === 'Synthèse')
        if (syntheseSector && syntheseSector.indicateursImpact) {
          this.taxonomyAxes = Object.keys(syntheseSector.indicateursImpact)
            .filter(axe => axe && axe !== 'Autre')
        }
        
        // Load chantier sectors and all sector chantiers (matches SideNavigation)
        this.chantierSectors = this.navigationData.sectors
          .filter(s => s.name !== 'Synthèse' && Object.keys(s.chantiers).length > 0)
          .map(s => s.name)
          .sort((a, b) => a.localeCompare(b, 'fr'))
        
        this.allSectorChantiers = {}
        this.navigationData.sectors
          .filter(s => s.name !== 'Synthèse')
          .forEach(s => {
            this.allSectorChantiers[s.name] = Object.entries(s.chantiers)
              .filter(([name]) => !isImpactAxe(name))
              .map(([name]) => ({
                id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                name: name
              }))
          })
        
        this.chantiers = []
      } else if (sectorData) {
        // Load chantiers for current sector (exclude impact axes like SideNavigation)
        this.chantiers = Object.entries(sectorData.chantiers)
          .filter(([name]) => !isImpactAxe(name))
          .map(([name]) => ({
            id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            name: name
          }))
        
        this.taxonomyAxes = []
        this.chantierSectors = []
        this.allSectorChantiers = {}
      }
    },
    handleChange(event) {
      const value = event.target.value
      const [type, ...rest] = value.split(':')
      const param = rest.join(':') // Rejoin in case value contains colons
      
      const isStaging = window.location.pathname.includes('/staging')
      const dash = dashboardRouteName(isStaging)
      const syn = SECTION_SYNTHESE_SLUG

      if (type === 'sector') {
        if (param === 'Synthèse') {
          router.push({ name: homeRouteName(isStaging) }).catch(err => {
            if (err.name !== 'NavigationDuplicated') console.error('Navigation error:', err)
          })
        } else {
          router.push({
            name: dash,
            query: { section: toSectionSlug(param), view: 'sectorial-engagements' }
          }).catch(err => {
            if (err.name !== 'NavigationDuplicated') console.error('Navigation error:', err)
          })
        }
      } else if (type === 'view') {
        if (param === 'about') {
          router.push({ name: homeRouteName(isStaging) }).catch(err => {
            if (err.name !== 'NavigationDuplicated') console.error('Navigation error:', err)
          })
        } else if (param === 'etat-environnement') {
          router.push({
            name: etatEnvironnementRouteName(isStaging),
            query: { section: syn }
          }).catch(err => {
            if (err.name !== 'NavigationDuplicated') console.error('Navigation error:', err)
          })
        } else if (param === 'chantiers-sectoriels') {
          router.push({
            name: chantiersRouteName(isStaging),
            query: { section: syn }
          }).catch(err => {
            if (err.name !== 'NavigationDuplicated') console.error('Navigation error:', err)
          })
        } else {
          router.push({
            name: dash,
            query: { section: syn, view: param }
          }).catch(err => {
            if (err.name !== 'NavigationDuplicated') console.error('Navigation error:', err)
          })
        }
      } else if (type === 'axe') {
        router.push({
          name: etatEnvironnementRouteName(isStaging),
          query: { section: impactAxeNameToSlug(param) }
        }).catch(err => {
          if (err.name !== 'NavigationDuplicated') console.error('Navigation error:', err)
        })
      } else if (type === 'chantierSynthese') {
        const [chantierId, chantierSector] = param.split(':')
        router.push({
          name: chantiersRouteName(isStaging),
          query: {
            section: toSectionSlug(chantierSector),
            chantier_id: chantierId,
          }
        }).catch(err => {
          if (err.name !== 'NavigationDuplicated') console.error('Navigation error:', err)
        })
      } else if (type === 'chantier') {
        router.push({
          name: dash,
          query: {
            section: toSectionSlug(this.activeSector),
            view: 'chantier',
            chantier_id: param
          }
        }).catch(err => {
          if (err.name !== 'NavigationDuplicated') console.error('Navigation error:', err)
        })
      } else if (type === 'page') {
        if (param === 'search') {
          router.push({ name: rechercheRouteName(isStaging) }).catch(err => {
            if (err.name !== 'NavigationDuplicated') console.error('Navigation error:', err)
          })
        }
      }
    }
  }
}
</script>

<style scoped>
.sector-selector-container {
  /* Hidden on all viewports for now — mobile/tablet use header menu (Navigation) */
  display: none !important;
  padding: 1rem;
  background-color: var(--background-default-grey, #f6f6f6);
  border-bottom: 1px solid var(--border-default-grey, #e5e5e5);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.fr-select-group {
  max-width: 100%;
}

.fr-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
  color: var(--text-title-grey, #161616);
}

.sector-select-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.sector-icon-wrapper {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sector-icon {
  display: block;
}

.fr-select {
  flex: 1;
  max-width: 100%;
  font-size: 1rem;
  padding: 0.75rem;
}

.fr-select.with-icon {
  flex: 1;
}

/* Optgroup styling */
.fr-select optgroup {
  font-weight: 600;
  color: var(--text-title-grey, #161616);
}

.fr-select option {
  font-weight: 400;
  padding: 0.5rem;
}

</style>
