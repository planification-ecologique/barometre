<template>
  <div class="etat-environnement">
    <!-- Breadcrumb -->
    <nav class="fr-breadcrumb" aria-label="vous êtes ici :">
      <ol class="fr-breadcrumb__list">
        <li>
          <a class="fr-breadcrumb__link" href="#" @click.prevent="goAccueil">Accueil</a>
        </li>
        <li>
          <span class="fr-breadcrumb__link" aria-current="page">Etat de l'environnement</span>
        </li>
      </ol>
    </nav>

    <h1 class="fr-h2 etat-title">Etat de l'environnement</h1>

    <!-- Ce qu'il faut retenir -->
    <div class="etat-callout">
      <h2 class="fr-h4 etat-callout-title">Ce qu'il faut retenir</h2>
      <p class="fr-text--md etat-callout-text">
        L'état de l'environnement est suivi à travers des indicateurs d'impact
        regroupés par grands axes : atténuation et adaptation au changement climatique,
        biodiversité, qualité de l'eau, pollution et économie circulaire.
      </p>
    </div>

    <!-- Quick access links -->
    <div class="etat-quick-access">
      <span class="etat-quick-label">Accès rapide aux axes d'impact</span>
      <div class="etat-quick-links">
        <a
          v-for="axe in displayAxes"
          :key="axe.name"
          class="etat-quick-link"
          :href="'#axe-' + slugify(axe.name)"
          @click.prevent="scrollToAxe(axe.name)"
        >
          → {{ axe.name }}
        </a>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="etat-loading">
      <p>Chargement des données...</p>
    </div>

    <!-- Axe sections -->
    <template v-else>
      <section
        v-for="axe in displayAxes"
        :key="axe.name"
        :id="'axe-' + slugify(axe.name)"
        class="etat-axe-section"
      >
        <div class="etat-axe-header">
          <h2 class="fr-h3 etat-axe-title">{{ axe.name }}</h2>
          <span class="etat-axe-stats">
            {{ axe.indicatorCount }} indicateurs
          </span>
        </div>

        <p v-if="axe.description" class="fr-text--md etat-axe-description">
          {{ axe.description }}
        </p>

        <!-- Indicators table -->
        <div class="etat-table-wrapper">
          <table class="etat-table">
            <thead>
              <tr>
                <th class="col-engagement">Engagement</th>
                <th class="col-indicateur">Indicateur</th>
                <th class="col-valeurs">Valeurs</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(indicator, idx) in axe.indicators"
                :key="axe.name + '-' + indicator.id + '-' + idx"
              >
                <td class="td-engagement">{{ indicator.engagementName || '–' }}</td>
                <td class="td-indicateur">
                  {{ indicator.label }}
                  <template v-if="indicator.labelUnit">
                    <br><br>
                    <em>Unité : {{ indicator.labelUnit }}</em>
                  </template>
                </td>
                <td class="td-valeurs">
                  <mini-chart
                    v-if="indicator.rawData"
                    :dataObj="indicator.rawData"
                  />
                </td>
              </tr>
              <tr v-if="axe.indicators.length === 0">
                <td class="td-engagement">{{ axe.engagement || '–' }}</td>
                <td class="td-empty">Pas d'indicateur disponible</td>
                <td class="td-valeurs"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>

<script>
import MiniChart from './MiniChart.vue'
import { getNavigationStructure, getIndicators, fetchEngagementLongMapping, fetchEngagementsByAxe, IMPACT_AXE_DISPLAY_ORDER } from '@/services/csvDataService.js'

const AXE_DESCRIPTIONS = {
  'Atténuation climat': 'Les indicateurs d\'atténuation suivent la réduction des émissions de gaz à effet de serre et la transition vers une économie bas-carbone.',
  'Adaptation climat': 'Les indicateurs d\'adaptation mesurent la capacité de la société et des territoires à faire face aux effets du changement climatique.',
  'Biodiversité': 'Les indicateurs de biodiversité suivent l\'état des écosystèmes, des espèces et des habitats naturels.',
  'Eau': 'Les indicateurs liés à l\'eau suivent la qualité et la gestion durable des ressources en eau.',
  'Pollution': 'Les indicateurs de pollution mesurent la qualité de l\'air, des sols et l\'exposition aux substances nocives.',
  'Economie circulaire': 'Les indicateurs d\'économie circulaire suivent la réduction des déchets, le recyclage et la sobriété des ressources.',
  'Économie circulaire': 'Les indicateurs d\'économie circulaire suivent la réduction des déchets, le recyclage et la sobriété des ressources.',
}

export default {
  name: 'EtatEnvironnement',
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
      displayAxes: []
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
        const [response, engagementLongMap, engagementByAxe] = await Promise.all([
          getNavigationStructure(environment),
          fetchEngagementLongMapping(),
          fetchEngagementsByAxe()
        ])

        if (response.status !== 'success') {
          this.isLoading = false
          return
        }

        const syntheseSector = response.data.sectors.find(s => s.name === 'Synthèse')
        if (!syntheseSector || !syntheseSector.indicateursImpact) {
          this.isLoading = false
          return
        }

        // Build axe structures and collect all grist IDs
        const allGristIds = []
        const axeStructures = []

        // Merge "Economie circulaire" and "Économie circulaire" into one
        const mergedImpact = {}
        for (const [axeName, indicators] of Object.entries(syntheseSector.indicateursImpact)) {
          const normalizedName = axeName === 'Economie circulaire' ? 'Économie circulaire' : axeName
          if (!mergedImpact[normalizedName]) {
            mergedImpact[normalizedName] = []
          }
          mergedImpact[normalizedName].push(...indicators)
        }

        for (const axeName of IMPACT_AXE_DISPLAY_ORDER) {
          const axeIndicators = mergedImpact[axeName] || []
          const gristIds = axeIndicators.map(item => item.gristId).filter(Boolean)
          allGristIds.push(...gristIds)

          axeStructures.push({
            name: axeName,
            description: AXE_DESCRIPTIONS[axeName] || '',
            indicatorCount: gristIds.length,
            gristIds,
            indicators: [],
            // Engagement for axe (used when no indicators, e.g. Adaptation climat)
            engagement: engagementByAxe.get(axeName) || ''
          })
        }

        // Fetch all indicator data at once
        if (allGristIds.length > 0) {
          const query = {
            filter_by: [{ field: 'grist_ids', values: allGristIds }],
            time_period: { date_start: '2015-01-01', date_end: '2031-01-01' }
          }
          const indicatorResponse = await getIndicators(query, environment)
          const allIndicators = indicatorResponse.results || []

          const indicatorMap = {}
          allIndicators.forEach(ind => {
            if (ind.id_indic) indicatorMap[ind.id_indic] = ind
          })

          for (const axe of axeStructures) {
            axe.indicators = axe.gristIds
              .map(gid => indicatorMap[gid])
              .filter(Boolean)
              .map(ind => this.buildIndicatorRow(ind, engagementLongMap))
          }
        }

        // Keep all axes (including Adaptation) even when empty, so quick access links always show
        this.displayAxes = axeStructures
      } catch (error) {
        console.error('Error loading etat environnement data:', error)
      } finally {
        this.isLoading = false
      }
    },
    buildIndicatorRow(indicator, engagementLongMap = new Map()) {
      const values = []
      let targetValue = null

      if (indicator.date && indicator.values) {
        const years = Array.isArray(indicator.date[0]) ? indicator.date[0] : indicator.date
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

      if (indicator.cible !== null && indicator.cible !== undefined && String(indicator.cible).trim() !== '' && !isNaN(indicator.cible)) {
        targetValue = parseFloat(indicator.cible)
      }

      let ecart = null
      if (targetValue !== null && values.length > 0) {
        const lastValue = values[values.length - 1]
        if (lastValue !== 0 && targetValue !== 0) {
          ecart = ((lastValue - targetValue) / Math.abs(targetValue)) * 100
        }
      }

      let description = ''
      if (indicator.label_description) {
        description = String(indicator.label_description).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
      }

      // Engagement from main CSV: use mapping to display long version (Thématique → Engagement)
      const rawEngagement = indicator.engagement || ''
      const engagementName = engagementLongMap.get(rawEngagement) || rawEngagement

      const unit = indicator.label_unit || indicator.unite

      return {
        label: indicator.label_indic || 'Indicateur',
        labelUnit: unit || '',
        engagementName,
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
      return ecart >= 0 ? 'ecart-positive' : 'ecart-negative'
    },
    scrollToAxe(axeName) {
      const id = 'axe-' + this.slugify(axeName)
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
    goAccueil() {
      const routeName = window.location.pathname.includes('/staging') ? 'staging-dashboard' : 'dashboard'
      this.$router.push({ name: routeName, query: { sector: 'Synthèse', view: 'about' } }).catch(() => {})
    }
  }
}
</script>

<style scoped lang="scss">
.etat-environnement {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Override DSFR default link styling to avoid double underlines */
.etat-environnement a {
  background-image: none;
}

/* Breadcrumb - matches ChantierDetail / SyntheseSectorielle */
.fr-breadcrumb {
  margin-bottom: 0;
}

.fr-breadcrumb__list {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  list-style: none !important;
  list-style-type: none !important;
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
.etat-title {
  margin-bottom: 0;
}

/* Callout */
.etat-callout {
  background: #f6f6f6;
  border-left: 4px solid #6a6af4;
  padding: 1.25rem 1.5rem;
}

.etat-callout-title {
  margin: 0 0 0.5rem;
}

.etat-callout-text {
  color: #3a3a3a;
  margin: 0;
}

/* Quick access links */
.etat-quick-access {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.etat-quick-label {
  font-size: 0.875rem;
  color: #3a3a3a;
}

.etat-quick-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.etat-quick-link {
  background: #e3e3fd;
  border: none;
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

.etat-quick-link:hover {
  background: #000091;
  color: #fff;
  text-decoration: none;
}

/* Axe sections */
.etat-axe-section {
  scroll-margin-top: 1.5rem;
}

.etat-axe-header {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.etat-axe-title {
  margin: 0;
}

.etat-axe-stats {
  font-size: 0.8125rem;
  color: #666;
  white-space: nowrap;
}

.etat-axe-description {
  color: #3a3a3a;
  margin-bottom: 1rem;
}

/* Table */
.etat-table-wrapper {
  overflow-x: auto;
  margin-bottom: 1rem;
}

.etat-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border: 1px solid #e5e5e5;
  font-size: 0.875rem;
}

.etat-table thead {
  background: #f6f6f6;
}

.etat-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  font-weight: 700;
  font-size: 0.8125rem;
  color: #3a3a3a;
  border-bottom: 2px solid #d6d6d6;
}

.col-engagement {
  width: 30%;
  min-width: 180px;
}

.col-indicateur {
  width: 35%;
  min-width: 180px;
}

.col-valeurs {
  width: 35%;
  min-width: 220px;
}

.etat-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e5e5;
  vertical-align: top;
}

.td-engagement {
  vertical-align: top;
  color: #3a3a3a;
  font-weight: 500;
  font-size: 0.875rem;
}

.td-valeurs {
  padding: 0.25rem 0 !important;
  height: 140px;
  vertical-align: middle !important;
  overflow: visible;
}

.td-indicateur {
  color: #3a3a3a;
  line-height: 1.4;
}

.td-empty {
  color: #929292;
  font-style: italic;
}


/* Loading */
.etat-loading {
  padding: 2rem;
  text-align: center;
  color: #666;
}

/* Responsive */
@media (max-width: 768px) {
  .etat-axe-header {
    flex-direction: column;
    gap: 0.25rem;
  }

  .etat-quick-access {
    flex-direction: column;
    align-items: flex-start;
  }

  .etat-table th,
  .etat-table td {
    padding: 0.5rem 0.625rem;
  }
}
</style>
