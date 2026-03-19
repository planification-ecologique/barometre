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
        L'amélioration de l'état de l'environnement constitue la finalité des stratégies environnementales. 
        Ces dernières fixent ainsi des ambitions en la matière ("engagements"), listées ci-après avec, le cas échéant, 
        un indicateur de mesure de l'atteinte de l'objectif. 
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
          <h2 class="fr-h3 etat-axe-title">
            <a
              class="etat-axe-title-link"
              href="#"
              :title="'Voir le détail pour ' + axe.name"
              :aria-label="'Voir le détail pour ' + axe.name"
              @click.prevent="goToAxeDetail(axe.name)"
            >
              {{ axe.name }}
              <span class="fr-icon-arrow-right-line" aria-hidden="true"></span>
            </a>
          </h2>
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
              <template v-for="group in getEngagementGroups(axe.indicators)">
                <tr
                  v-for="(indicator, idx) in group.indicators"
                  :key="axe.name + '-' + (group.engagementName || '') + '-' + idx"
                  :class="{ 'first-row-of-engagement': idx === 0 }"
                >
                  <td
                    v-if="idx === 0"
                    :rowspan="group.indicators.length || 1"
                    class="td-engagement"
                  >
                    {{ group.engagementName || '–' }}
                  </td>
                  <td class="td-indicateur">
                    {{ indicator.label }}
                    <template v-if="indicator.labelUnit">
                      <br><br>
                      <em>Unité : {{ indicator.labelUnit }}</em>
                    </template>
                    <template v-if="indicator.legendItems && indicator.legendItems.length > 0">
                      <br><br>
                      <div class="td-indicateur-legend-wrap">
                        <span v-for="(item, i) in indicator.legendItems" :key="i" class="td-indicateur-legend-item">
                          <span class="td-indicateur-legend-dot" :style="{ backgroundColor: item.color }"></span>
                          <span class="td-indicateur-legend-label">{{ item.label }}</span>
                        </span>
                      </div>
                    </template>
                  </td>
                  <td class="td-valeurs">
                    <mini-chart
                      v-if="indicator.rawData"
                      :dataObj="indicator.rawData"
                    />
                  </td>
                </tr>
              </template>
              <tr v-if="axe.indicators.length === 0">
                <td class="td-engagement">{{ axe.engagement || '–' }}</td>
                <td class="td-empty">
                  <span>Pas d'indicateur disponible</span>
                  <span class="td-empty-message">L'indicateur n'est pas encore défini ou les données ne sont pas encore disponibles.</span>
                </td>
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
import { getAllColors, getHexaFromName } from '@/utils.js'

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
            indicatorCount: 0, // Will be set after indicators are populated
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
            axe.indicatorCount = axe.indicators.length
          }
        }

        // Set count for axes with no indicators (e.g. Adaptation climat)
        for (const axe of axeStructures) {
          if (axe.indicatorCount === undefined) {
            axe.indicatorCount = 0
          }
        }

        // Keep all axes (including Adaptation) even when empty, so quick access links always show
        this.displayAxes = axeStructures
      } catch (error) {
        console.error('Error loading etat environnement data:', error)
      } finally {
        this.isLoading = false
        this.$nextTick(() => this.scrollToHash())
      }
    },
    scrollToHash() {
      const hash = this.$route?.hash
      if (hash && hash.startsWith('#axe-')) {
        const el = document.getElementById(hash.slice(1))
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

      // Légende avec couleurs pour les graphes non mono-barre
      let legendItems = []
      const chartType = indicator.type_de_graphique || 'Barres simple'
      const palette = getAllColors()

      if (chartType === 'Barres empilées' || chartType === 'Courbes indépendantes') {
        const sg = indicator.label_sous_groupe
        const labels = Array.isArray(sg) && sg.length > 1 ? sg.filter(Boolean) : []
        legendItems = labels.map((lbl, i) => ({
          label: lbl,
          color: getHexaFromName(palette[i] || palette[0])
        }))
      } else if (chartType === 'Barres simple' && indicator.values?.legend) {
        const leg = indicator.values.legend
        const colors = indicator.values?.colors
        if (Array.isArray(leg) && leg.length > 1) {
          legendItems = leg.filter(Boolean).map((lbl, i) => {
            const c = Array.isArray(colors) && colors[i]
              ? (typeof colors[i] === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(colors[i]) ? colors[i] : getHexaFromName(colors[i]))
              : getHexaFromName(palette[i] || palette[0])
            return { label: String(lbl), color: c }
          })
        }
      }

      return {
        label: indicator.label_indic || 'Indicateur',
        labelUnit: unit || '',
        legendItems,
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
    getEngagementGroups(indicators) {
      if (!indicators || indicators.length === 0) return []
      const byEngagement = new Map()
      for (const ind of indicators) {
        const key = ind.engagementName || '–'
        if (!byEngagement.has(key)) byEngagement.set(key, [])
        byEngagement.get(key).push(ind)
      }
      return Array.from(byEngagement.entries())
        .map(([engagementName, indicators]) => ({ engagementName, indicators }))
        .sort((a, b) => (a.engagementName || '').localeCompare(b.engagementName || '', 'fr'))
    },
    scrollToAxe(axeName) {
      const id = 'axe-' + this.slugify(axeName)
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
    goAccueil() {
      const routeName = window.location.pathname.includes('/staging') ? 'staging-dashboard' : 'dashboard'
      this.$router.push({ name: routeName, query: { sector: 'Synthèse', view: 'about' } }).catch(() => {})
    },
    goToAxeDetail(axeName) {
      const routeName = window.location.pathname.includes('/staging') ? 'staging-dashboard' : 'dashboard'
      this.$router.push({
        name: routeName,
        query: { sector: 'Synthèse', view: 'general-engagements', axe: axeName }
      }).catch(() => {})
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

/* Quick access links - same structure as Chantiers Sectoriels (label + links on 2 lines) */
.etat-quick-access {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
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

.etat-axe-title-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #000091;
  text-decoration: none;
  transition: color 0.15s;
}

.etat-axe-title-link:hover,
.etat-axe-title-link:focus {
  color: #1212ff;
}

.etat-axe-title-link .fr-icon-arrow-right-line {
  font-size: 1rem;
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
  width: 45%;
  min-width: 220px;
}

.col-indicateur {
  width: 30%;
  min-width: 140px;
}

.col-valeurs {
  width: 25%;
  min-width: 180px;
}

.etat-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e5e5;
  vertical-align: top;
}

.first-row-of-engagement td {
  border-top: 1px solid #d6d6d6;
}

.td-engagement {
  vertical-align: top;
  color: #3a3a3a;
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.5;
}

.td-valeurs {
  padding: 0.75rem 0.5rem !important;
  height: 160px;
  vertical-align: middle !important;
  overflow: visible;
}

.td-indicateur {
  color: #3a3a3a;
  line-height: 1.5;
}

.td-indicateur-legend-wrap {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1rem;
  font-size: 0.8125rem;
  color: #666;
  line-height: 1.5;
}

.td-indicateur-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  white-space: nowrap;
}

.td-indicateur-legend-dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.td-indicateur-legend-label {
  flex: 0 1 auto;
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


  .etat-table th,
  .etat-table td {
    padding: 0.5rem 0.625rem;
  }
}
</style>
