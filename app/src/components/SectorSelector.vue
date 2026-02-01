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
          
          <!-- Synthèse sub-navigation (only shown when on Synthèse) -->
          <optgroup v-if="activeSector === 'Synthèse'" label="Navigation Synthèse">
            <option value="view:about">À propos</option>
            <option value="view:engagements-table">Indicateurs d'impact - Tableau</option>
            <option v-for="axe in taxonomyAxes" :key="'axe-' + axe" :value="'axe:' + axe">
              Indicateurs d'impact - {{ axe }}
            </option>
            <option value="view:chantiers-table">Chantiers - Tableau</option>
            <option v-for="sectorName in chantierSectors" :key="'chantier-' + sectorName" :value="'chantierSector:' + sectorName">
              Chantiers - {{ sectorName }}
            </option>
          </optgroup>
          
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
import { getNavigationStructure } from '@/services/csvDataService.js'
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
      chantiers: []
    }
  },
  computed: {
    currentSectorIcon() {
      return getSectorIcon(this.activeSector)
    },
    // Use route-based sector to ensure consistency with currentValue
    activeSector() {
      return this.$route?.query?.sector || this.currentSector || 'Synthèse'
    },
    currentValue() {
      // Determine current value based on route
      const query = this.$route?.query || {}
      const path = this.$route?.path || ''
      
      if (path.includes('search')) {
        return 'page:search'
      }
      
      const view = query.view
      const sector = query.sector || 'Synthèse'
      
      if (view === 'about') {
        return 'view:about'
      } else if (view === 'engagements-table') {
        return 'view:engagements-table'
      } else if (view === 'chantiers-table') {
        return 'view:chantiers-table'
      } else if (view === 'general-engagements' && query.axe) {
        return 'axe:' + query.axe
      } else if (view === 'general-chantiers' && query.sectorFilter) {
        return 'chantierSector:' + query.sectorFilter
      } else if (view === 'chantier' && query.chantier_id) {
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
        // Load taxonomy axes
        const syntheseSector = this.navigationData.sectors.find(s => s.name === 'Synthèse')
        if (syntheseSector && syntheseSector.indicateursImpact) {
          this.taxonomyAxes = Object.keys(syntheseSector.indicateursImpact)
            .filter(axe => axe && axe !== 'Autre')
            .sort()
        }
        
        // Load chantier sectors
        this.chantierSectors = this.navigationData.sectors
          .filter(s => s.name !== 'Synthèse' && Object.keys(s.chantiers).length > 0)
          .map(s => s.name)
          .sort((a, b) => a.localeCompare(b, 'fr'))
        
        this.chantiers = []
      } else if (sectorData) {
        // Load chantiers for current sector
        this.chantiers = Object.entries(sectorData.chantiers)
          .map(([name, chantierData]) => ({
            id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            name: name
          }))
          .sort((a, b) => a.name.localeCompare(b.name))
        
        this.taxonomyAxes = []
        this.chantierSectors = []
      }
    },
    handleChange(event) {
      const value = event.target.value
      const [type, ...rest] = value.split(':')
      const param = rest.join(':') // Rejoin in case value contains colons
      
      const isStaging = window.location.pathname.includes('/staging')
      const routeName = isStaging ? 'staging-dashboard' : 'dashboard'
      const searchRouteName = isStaging ? 'staging-search' : 'search'
      
      if (type === 'sector') {
        // Navigate to sector
        const query = { sector: param }
        if (param === 'Synthèse') {
          query.view = 'about'
        } else {
          query.view = 'sectorial-engagements'
        }
        router.push({ name: routeName, query }).catch(err => {
          if (err.name !== 'NavigationDuplicated') console.error('Navigation error:', err)
        })
      } else if (type === 'view') {
        // Navigate to specific view
        router.push({
          name: routeName,
          query: { sector: this.currentSector, view: param }
        }).catch(err => {
          if (err.name !== 'NavigationDuplicated') console.error('Navigation error:', err)
        })
      } else if (type === 'axe') {
        // Navigate to specific taxonomy axe
        router.push({
          name: routeName,
          query: { sector: 'Synthèse', view: 'general-engagements', axe: param }
        }).catch(err => {
          if (err.name !== 'NavigationDuplicated') console.error('Navigation error:', err)
        })
      } else if (type === 'chantierSector') {
        // Navigate to chantiers for a specific sector
        router.push({
          name: routeName,
          query: { sector: 'Synthèse', view: 'general-chantiers', sectorFilter: param }
        }).catch(err => {
          if (err.name !== 'NavigationDuplicated') console.error('Navigation error:', err)
        })
      } else if (type === 'chantier') {
        // Navigate to specific chantier
        router.push({
          name: routeName,
          query: { sector: this.currentSector, view: 'chantier', chantier_id: param }
        }).catch(err => {
          if (err.name !== 'NavigationDuplicated') console.error('Navigation error:', err)
        })
      } else if (type === 'page') {
        // Navigate to other pages
        if (param === 'search') {
          router.push({ name: searchRouteName }).catch(err => {
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
  display: none; /* Hidden by default (desktop) */
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

/* Mobile and Medium (tablet): show sector selector */
@media (max-width: 991px) {
  .sector-selector-container {
    display: block; /* Show on mobile and tablet */
    padding: 0.75rem 1rem;
  }
  
  .fr-label {
    font-size: 0.875rem;
    margin-bottom: 0.375rem;
  }
  
  .sector-icon-wrapper {
    display: none; /* Hide icon on mobile/tablet to save space */
  }
  
  .fr-select {
    font-size: 1rem;
    padding: 0.75rem;
    max-width: 100%;
    flex: 1;
  }
}

/* Medium (tablet) specific adjustments */
@media (min-width: 769px) and (max-width: 991px) {
  .sector-selector-container {
    padding: 0.75rem 1.5rem;
  }
  
  .fr-select-group {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .fr-label {
    margin-bottom: 0;
    white-space: nowrap;
  }
  
  .fr-select {
    min-width: 250px;
    max-width: 100%;
  }
}

/* Desktop: hide sector selector (use Navigation.vue tabs instead) */
@media (min-width: 992px) {
  .sector-selector-container {
    display: none; /* Hidden on desktop */
  }
}
</style>
