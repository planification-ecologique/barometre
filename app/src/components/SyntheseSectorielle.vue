<template>
  <div class="synthese-sectorielle">
    <!-- Breadcrumb -->
    <nav class="fr-breadcrumb" aria-label="vous êtes ici :">
      <ol class="fr-breadcrumb__list">
        <li>
          <a class="fr-breadcrumb__link" href="#" @click.prevent="goAccueil">Accueil</a>
        </li>
        <li>
          <span class="fr-breadcrumb__link" aria-current="page">Chantiers sectoriels</span>
        </li>
      </ol>
    </nav>

    <h1 class="fr-h2 synthese-title">Synthèse des chantiers sectoriels</h1>

    <!-- Ce qu'il faut retenir -->
    <div class="synthese-callout">
      <h2 class="fr-h4 synthese-callout-title">Ce qu'il faut retenir</h2>
      <p class="fr-text--md synthese-callout-text">
        Le baromètre de la planification écologique suit l'avancement des chantiers
        de transformation écologique à travers des indicateurs mesurables.
        Retrouvez ci-dessous la synthèse par secteur avec les principaux
        indicateurs et leur écart par rapport aux cibles fixées.
      </p>
    </div>

    <!-- Quick access links -->
    <div class="synthese-quick-access">
      <span class="synthese-quick-label">Accès rapide aux synthèses sectorielles</span>
      <div class="synthese-quick-links">
        <a
          v-for="sector in displaySectors"
          :key="sector.name"
          class="synthese-quick-link"
          :href="'#sector-' + slugify(sector.name)"
          @click.prevent="scrollToSector(sector.name)"
        >
          → {{ sector.name }}
        </a>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="synthese-loading">
      <p>Chargement des données...</p>
    </div>

    <!-- Sector sections -->
    <template v-else>
      <section
        v-for="sector in displaySectors"
        :key="sector.name"
        :id="'sector-' + slugify(sector.name)"
        class="synthese-sector-section"
      >
        <div class="synthese-sector-header">
          <h2 class="fr-h3 synthese-sector-title">{{ sector.name }}</h2>
          <span class="synthese-sector-stats">
            {{ sector.chantierCount }} chantiers – {{ sector.levierCount }} leviers
          </span>
        </div>

        <p class="fr-text--md synthese-sector-description">
          {{ sector.description }}
        </p>

        <!-- Chantiers table -->
        <div class="synthese-table-wrapper">
          <table class="synthese-table">
            <thead>
              <tr>
                <th class="col-chantier">
                  <div class="th-inner">
                    Chantier
                    <span v-if="sector.engagementLabel" class="th-badge">{{ sector.engagementLabel }}</span>
                  </div>
                </th>
                <th class="col-indicateur">Indicateur</th>
                <th class="col-valeurs">Valeurs</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="chantier in sector.chantiers">
                <tr
                  v-for="(indicator, idx) in chantier.indicators"
                  :key="chantier.name + '-' + idx"
                  :class="{ 'first-row-of-chantier': idx === 0 }"
                  class="clickable-row"
                  @click="scrollToSector(sector.name)"
                >
                  <!-- Chantier name (only on first row, with rowspan) -->
                  <td
                    v-if="idx === 0"
                    :rowspan="chantier.indicators.length || 1"
                    class="td-chantier"
                  >
                    <a
                      class="chantier-link"
                      :href="chantierHref(sector.name, chantier)"
                      @click.stop="handleChantierClick($event, sector.name, chantier)"
                    >
                      {{ chantier.name }}
                    </a>
                    <div class="chantier-engagements">
                      <span
                        v-for="(eng, eIdx) in chantier.engagementBadges"
                        :key="eIdx"
                        class="engagement-badge"
                        :title="eng"
                      >
                        {{ eng }}
                      </span>
                      <span
                        v-if="chantier.remainingEngagements > 0"
                        class="engagement-badge engagement-badge--more"
                        :data-tooltip="chantier.remainingEngagementNames"
                        :title="chantier.remainingEngagementNames"
                        @click.stop
                      >
                        +{{ chantier.remainingEngagements }}
                      </span>
                    </div>
                  </td>
                  <!-- Indicator -->
                  <td class="td-indicateur">
                    {{ indicator.label }}
                    <template v-if="indicator.labelUnit">
                      <br><br>
                      <em>Unité : {{ indicator.labelUnit }}</em>
                    </template>
                  </td>
                  <!-- Mini chart (same as GraphBox) -->
                  <td class="td-valeurs">
                    <mini-chart
                      v-if="indicator.rawData"
                      :dataObj="indicator.rawData"
                    />
                  </td>
                </tr>
                <!-- Fallback if chantier has no indicators -->
                <tr
                  v-if="!chantier.indicators || chantier.indicators.length === 0"
                  :key="chantier.name + '-empty'"
                  class="clickable-row"
                  @click="scrollToSector(sector.name)"
                >
                  <td class="td-chantier">
                    <a
                      class="chantier-link"
                      :href="chantierHref(sector.name, chantier)"
                      @click.stop="handleChantierClick($event, sector.name, chantier)"
                    >
                      {{ chantier.name }}
                    </a>
                  </td>
                  <td class="td-indicateur td-empty" colspan="2">
                    <span>Pas d'indicateur disponible</span>
                    <span class="td-empty-message">L'indicateur n'est pas encore défini ou les données ne sont pas encore disponibles.</span>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>

<script>
import MiniChart from './MiniChart.vue'
import { getNavigationStructure, getIndicators, isImpactAxe } from '@/services/csvDataService.js'

const SECTOR_DESCRIPTIONS = {
  'Se déplacer': 'Le secteur "Se déplacer" couvre les déplacements de voyageurs et de marchandises, pour l\'ensemble des modes de transports (terrestres, aériens, maritimes et fluviaux).',
  'Se loger': 'Le secteur "Se loger" traite de la rénovation énergétique des bâtiments, du chauffage et de la construction durable pour réduire l\'empreinte carbone du parc immobilier.',
  'Préserver et valoriser nos écosystèmes': 'Le secteur "Préserver et valoriser nos écosystèmes" vise à protéger la biodiversité, les forêts, les sols et les milieux naturels tout en renforçant leur rôle de puits de carbone.',
  'Produire': 'Le secteur "Produire" concerne la décarbonation de l\'industrie, le développement des énergies renouvelables et la transformation des procédés industriels.',
  'Se nourrir': 'Le secteur "Se nourrir" couvre l\'ensemble de la chaîne alimentaire, de la production agricole à la consommation, en passant par la transformation et la distribution.',
  'Consommer': 'Le secteur "Consommer" traite de l\'économie circulaire, de la réduction des déchets et de la transformation des modes de consommation vers plus de sobriété.'
}

export default {
  name: 'SyntheseSectorielle',
  components: {
    MiniChart
  },
  props: {
    params: {
      type: Object,
      default: () => ({})
    },
    useStaging: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isLoading: true,
      navigationData: null,
      displaySectors: [],
      indicatorDataCache: {}
    }
  },
  async mounted() {
    await this.loadData()
  },
  methods: {
    slugify(str) {
      return String(str).toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    },
    async loadData() {
      this.isLoading = true
      try {
        const environment = this.useStaging ? 'staging' : 'production'
        const response = await getNavigationStructure(environment)

        if (response.status !== 'success') {
          this.isLoading = false
          return
        }

        this.navigationData = response.data

        // Build the display structure for each non-Synthèse sector
        const sectors = response.data.sectors.filter(s => s.name !== 'Synthèse')

        // Collect all grist IDs we need across all sectors
        const allGristIds = []
        const sectorStructures = []

        for (const sector of sectors) {
          const chantiers = []
          const chantierEntries = Object.entries(sector.chantiers || {})
            .filter(([name]) => !isImpactAxe(name))
            .sort(([a], [b]) => a.localeCompare(b, 'fr'))

          let levierCount = 0

          for (const [chantierName, chantierData] of chantierEntries) {
            const levierNames = Object.keys(chantierData.leviers || {})
              .filter(l => l !== 'Indicateur de chantier' && l !== 'Autres indicateurs' && l !== "Indicateur d'impact - autres")

            levierCount += levierNames.length

            // Get the "Indicateur de chantier" items
            const chantierIndicators = chantierData.leviers['Indicateur de chantier'] || []
            const gristIds = chantierIndicators.map(item => item.gristId).filter(Boolean)
            allGristIds.push(...gristIds)

            // Build engagement badges from levier names
            // Show up to 2 visible, rest as +N with tooltip
            const maxVisible = 2
            const visibleBadges = levierNames.slice(0, maxVisible)
            const remainingNames = levierNames.slice(maxVisible)

            chantiers.push({
              name: chantierName,
              id: chantierName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
              gristIds,
              engagementBadges: visibleBadges,
              remainingEngagements: remainingNames.length,
              remainingEngagementNames: remainingNames.join(', '),
              indicators: [], // Will be populated after data fetch
              sortedLeviers: chantierData.sortedLeviers || []
            })
          }

          sectorStructures.push({
            name: sector.name,
            description: SECTOR_DESCRIPTIONS[sector.name] || '',
            chantierCount: chantierEntries.length,
            levierCount,
            engagementLabel: 'Engagement soutenu',
            chantiers
          })
        }

        // Fetch all indicator data at once
        if (allGristIds.length > 0) {
          const query = {
            filter_by: [{ field: 'grist_ids', values: allGristIds }],
            time_period: { date_start: '2015-01-01', date_end: '2031-01-01' }
          }
          const environment = this.useStaging ? 'staging' : 'production'
          const indicatorResponse = await getIndicators(query, environment)
          const allIndicators = indicatorResponse.results || []

          // Index indicators by grist ID
          const indicatorMap = {}
          allIndicators.forEach(ind => {
            if (ind.id_indic) indicatorMap[ind.id_indic] = ind
          })

          // Populate each chantier with its indicators
          for (const sector of sectorStructures) {
            for (const chantier of sector.chantiers) {
              chantier.indicators = chantier.gristIds
                .map(gid => indicatorMap[gid])
                .filter(Boolean)
                .map(ind => this.buildIndicatorRow(ind))
            }
          }
        }

        this.displaySectors = sectorStructures
      } catch (error) {
        console.error('Error loading synthèse data:', error)
      } finally {
        this.isLoading = false
      }
    },
    buildIndicatorRow(indicator) {
      // Extract time series values (non-target, non-null)
      // Data format from csvDataService:
      //   indicator.date = [["2017", "2018", ...]]  (array of arrays)
      //   indicator.values = [[val1, val2, ...], ...]  (array of series arrays)
      const values = []
      let targetValue = null

      if (indicator.date && indicator.values) {
        // date[0] is the array of year strings
        const years = Array.isArray(indicator.date[0]) ? indicator.date[0] : indicator.date
        // values[0] is the first (or only) data series
        const series = Array.isArray(indicator.values[0]) ? indicator.values[0] : indicator.values

        if (years.length > 0 && series.length > 0) {
          years.forEach((year, i) => {
            const val = series[i]
            if (val !== null && val !== undefined && !isNaN(val)) {
              values.push(parseFloat(val))
            }
          })
        }
      }

      // Get target value (cible)
      if (indicator.cible !== null && indicator.cible !== undefined && String(indicator.cible).trim() !== '' && !isNaN(indicator.cible)) {
        targetValue = parseFloat(indicator.cible)
      }

      // Compute ecart vs cible
      let ecart = null
      if (targetValue !== null && values.length > 0) {
        const lastValue = values[values.length - 1]
        if (lastValue !== 0 && targetValue !== 0) {
          // Percentage difference relative to target
          ecart = ((lastValue - targetValue) / Math.abs(targetValue)) * 100
        }
      }

      // Extract plain text description for tooltip
      let description = ''
      if (indicator.label_description) {
        description = String(indicator.label_description).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
      }

      const unit = indicator.label_unit || indicator.unite;
      const labelBase = indicator.label_indic || 'Indicateur';
      return {
        label: labelBase,
        labelUnit: unit || '',
        values,
        targetValue,
        ecart,
        description,
        id: indicator.id_indic,
        rawData: indicator
      }
    },
    formatEcart(ecart) {
      if (ecart === null || ecart === undefined) return ''
      const sign = ecart >= 0 ? '+ ' : '- '
      return sign + Math.abs(ecart).toFixed(0) + '%'
    },
    ecartClass(ecart) {
      if (ecart === null) return ''
      // For environmental targets, being below target (negative ecart) is often good
      // But this depends on the indicator direction, so we keep it neutral for now
      return ecart >= 0 ? 'ecart-positive' : 'ecart-negative'
    },
    scrollToSector(sectorName) {
      const id = 'sector-' + this.slugify(sectorName)
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
    goAccueil() {
      this.$emit('navigate', { view: 'about', sector: 'Synthèse' })
    },
    chantierHref(sectorName, chantier) {
      const routeName = window.location.pathname.includes('/staging') ? 'staging-dashboard' : 'dashboard'
      const route = this.$router.resolve({
        name: routeName,
        query: {
          sector: 'Synthèse',
          view: 'chantier',
          chantier_id: chantier.id,
          chantier_sector: sectorName
        }
      })
      return route.href
    },
    handleChantierClick(event, sectorName, chantier) {
      if (event.ctrlKey || event.metaKey || event.button === 1) {
        return
      }
      event.preventDefault()
      this.goToChantier(sectorName, chantier)
    },
    goToChantier(sectorName, chantier) {
      // Navigate to chantier detail, staying under Synthèse sector
      // The real sector is passed as chantier_sector for display
      const routeName = window.location.pathname.includes('/staging') ? 'staging-dashboard' : 'dashboard'
      this.$router.push({
        name: routeName,
        query: {
          sector: 'Synthèse',
          view: 'chantier',
          chantier_id: chantier.id,
          chantier_sector: sectorName
        }
      }).catch(() => {})
    }
  }
}
</script>

<style scoped lang="scss">
.synthese-sectorielle {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Breadcrumb */
.fr-breadcrumb {
  margin-bottom: 0;
}

.fr-breadcrumb__list {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.75rem;
  color: #666;
}

.fr-breadcrumb__list li::before {
  content: '>';
  margin-right: 0.5rem;
}

.fr-breadcrumb__list li:first-child::before {
  content: '';
  margin-right: 0;
}

/* Override DSFR default link styling to avoid double underlines */
.synthese-sectorielle a {
  background-image: none;
}

.fr-breadcrumb__link {
  color: #000091;
  text-decoration: underline;
  text-underline-offset: 2px;
  font-size: 0.75rem;
}

.fr-breadcrumb__link[aria-current] {
  color: #3a3a3a;
  text-decoration: none;
}

/* Title */
.synthese-title {
  margin-bottom: 0;
}

/* Callout */
.synthese-callout {
  background: #f6f6f6;
  border-left: 4px solid #6a6af4;
  padding: 1.25rem 1.5rem;
}

.synthese-callout-title {
  margin: 0 0 0.5rem;
}

.synthese-callout-text {
  color: #3a3a3a;
  margin: 0;
}

/* Quick access links - label and buttons on 2 lines like EtatEnvironnement */
.synthese-quick-access {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.synthese-quick-label {
  font-size: 0.875rem;
  color: #3a3a3a;
}

.synthese-quick-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.synthese-quick-link {
  background: transparent;
  border: 1px solid #000091;
  border-radius: 999px;
  color: #000091;
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.3;
  padding: 0.3rem 0.875rem;
  text-decoration: none;
  white-space: nowrap;
  transition: background-color 0.15s, color 0.15s;
}

.synthese-quick-link:hover {
  background: #000091;
  color: #fff;
  text-decoration: none;
}

/* Sector sections */
.synthese-sector-section {
  scroll-margin-top: 1.5rem;
}

.synthese-sector-header {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.synthese-sector-title {
  margin: 0;
}

.synthese-sector-stats {
  font-size: 0.8125rem;
  color: #666;
  white-space: nowrap;
}

.synthese-sector-description {
  color: #3a3a3a;
  margin-bottom: 1rem;
}

/* Table */
.synthese-table-wrapper {
  overflow-x: auto;
  margin-bottom: 1rem;
}

.synthese-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border: 1px solid #e5e5e5;
  font-size: 0.875rem;
}

.synthese-table thead {
  background: #f6f6f6;
}

.synthese-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  font-weight: 700;
  font-size: 0.8125rem;
  color: #3a3a3a;
  border-bottom: 2px solid #d6d6d6;
}

.th-inner {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.th-badge {
  display: inline-block;
  background: #e3e3fd;
  color: #000091;
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 0.15rem 0.625rem;
  border-radius: 999px;
  width: fit-content;
}

.col-chantier {
  width: 30%;
  min-width: 200px;
}

.col-indicateur {
  width: 35%;
  min-width: 180px;
}

.col-valeurs {
  width: 35%;
  min-width: 200px;
  text-align: center;
}

.synthese-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e5e5;
  vertical-align: top;
}

.first-row-of-chantier td {
  border-top: 1px solid #d6d6d6;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.1s;
}

.clickable-row:hover {
  background-color: #f6f6f6;
}

.td-chantier {
  vertical-align: top;
}

/* Align first line of indicator with first line of chantier (indicator was slightly above) */
.first-row-of-chantier .td-indicateur {
  padding-top: 1rem;
}

.chantier-link {
  color: #000091;
  text-decoration: underline;
  text-underline-offset: 2px;
  font-weight: 600;
  font-size: 0.875rem;
  background-image: none;
}

.chantier-link:hover,
.chantier-link:focus {
  text-decoration: none;
}

.chantier-engagements {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.engagement-badge {
  display: inline-block;
  max-width: 10em;
  background: #e3e3fd;
  color: #000091;
  font-size: 0.6875rem;
  font-weight: 500;
  padding: 0.2rem 0.625rem;
  border-radius: 999px;
  line-height: 1.4;
  vertical-align: baseline;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: background-color 0.15s, color 0.15s;
}

.engagement-badge:hover {
  background: #000091;
  color: #fff;
  max-width: none;
  overflow: visible;
  text-overflow: clip;
}

.engagement-badge--more {
  background: #f0f0f0;
  color: #666;
  cursor: help !important;
  border-radius: 999px;
  position: relative;
  z-index: 10;
}

/* Custom tooltip for +X badge (native title can be clipped by overflow) */
.engagement-badge--more[data-tooltip]:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 50%;
  transform: translateX(-50%);
  background: #1e1e1e;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 400;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  white-space: normal;
  max-width: 280px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  pointer-events: none;
  line-height: 1.4;
}

.td-valeurs {
  padding: 0.75rem 0.5rem !important;
  height: 160px;
  vertical-align: middle !important;
  overflow: visible;
  text-align: center;
}

.td-indicateur {
  color: #3a3a3a;
  line-height: 1.4;
}

.td-empty {
  color: #929292;
  font-style: italic;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.td-empty-message {
  font-style: normal;
  font-size: 0.8125rem;
  color: #666;
}


/* Loading */
.synthese-loading {
  padding: 2rem;
  text-align: center;
  color: #666;
}

/* Responsive */
@media (max-width: 768px) {
  .synthese-sector-header {
    flex-direction: column;
    gap: 0.25rem;
  }

  .synthese-quick-access {
    flex-direction: column;
    align-items: flex-start;
  }

  .synthese-table th,
  .synthese-table td {
    padding: 0.5rem 0.625rem;
  }
}
</style>
