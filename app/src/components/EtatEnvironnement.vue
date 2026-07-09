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
      <span class="etat-quick-label">Accès rapide aux axes de la taxonomie européenne</span>
      <div class="etat-quick-links">
        <a
          v-for="axe in displayAxes"
          :key="axe.name"
          class="etat-quick-link"
          :href="'#axe-' + impactAxeSectionSlug(axe.name)"
          :title="axe.name"
          @click.prevent="scrollToAxe(axe.name)"
        >
          → {{ impactAxeNomCourt(axe.name) }}
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
        :id="'axe-' + impactAxeSectionSlug(axe.name)"
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
              <span class="etat-axe-title-text">{{ axe.name }}<span class="fr-icon-arrow-right-line etat-axe-title-arrow" aria-hidden="true"></span></span>
            </a>
          </h2>
          <span class="etat-axe-stats">
            {{ axe.indicatorCount }} indicateurs
          </span>
        </div>

        <!-- Description + tableau des indicateurs -->
        <div class="etat-axe-content">
          <div
            v-if="axe.description"
            class="fr-text--md etat-axe-description"
            v-html="axe.description"
          ></div>
          <div class="etat-table-wrapper">
          <table class="etat-table">
            <thead>
              <tr>
                <th class="col-engagement">Engagement</th>
                <th class="col-indicateur">Indicateur</th>
                <th class="col-valeurs">
                  <synthesis-valeurs-header-legend :indicators="axeHeaderLegendIndicators(axe)" />
                </th>
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
                      <template v-if="indicator.rawData && indicator.rawData.label_sources">
                        <br><br>
                        <em>
                          Source : {{ indicator.rawData.label_sources }}
                          <a
                            v-if="sourceUrl(indicator.rawData)"
                            class="source-link-icon"
                            :href="sourceUrl(indicator.rawData)"
                            target="_blank"
                            rel="noopener external"
                            aria-label="Ouvrir la source (nouvel onglet)"
                            @click.stop
                            @mousedown.stop
                          >
                          </a>
                        </em>
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
        </div>
      </section>
    </template>
  </div>
</template>

<script>
import MiniChart from './MiniChart.vue'
import SynthesisValeursHeaderLegend from './SynthesisValeursHeaderLegend.vue'
import {
  impactAxeNomCourt as impactAxeNomCourtFromTaxonomy,
} from '@/services/csvDataService.js'
import {
  ensureShellViewData,
  peekShellViewData,
  SHELL_VIEW_ETAT,
} from '@/services/shellViewDataService.js'
import { homeRouteName, etatEnvironnementRouteName } from '@/config/routeNames.js'
import { impactAxeNameToSlug } from '@/utils/impactAxeUrl.js'

export default {
  name: 'EtatEnvironnement',
  components: {
    MiniChart,
    SynthesisValeursHeaderLegend
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
  created() {
    this.hydrateFromShellCache()
  },
  async mounted() {
    if (this.isLoading) {
      await this.loadData()
    } else {
      this.$nextTick(() => this.scrollToHash())
    }
  },
  methods: {
    hydrateFromShellCache() {
      const environment = this.useStaging ? 'staging' : 'production'
      const cached = peekShellViewData(SHELL_VIEW_ETAT, environment)
      if (cached?.displayAxes) {
        this.displayAxes = cached.displayAxes
        this.isLoading = false
        return true
      }
      return false
    },
    sourceUrl(rawData) {
      return rawData?.lien_donnees_source || rawData?.lien_site_source || ''
    },
    axeHeaderLegendIndicators (axe) {
      return (axe?.indicators || [])
        .map((indicator) => indicator?.rawData)
        .filter(Boolean)
    },
    impactAxeSectionSlug(nomComplet) {
      return impactAxeNameToSlug(nomComplet)
    },
    async loadData() {
      if (this.hydrateFromShellCache()) {
        this.$nextTick(() => this.scrollToHash())
        return
      }
      this.isLoading = true
      try {
        const environment = this.useStaging ? 'staging' : 'production'
        const data = await ensureShellViewData(SHELL_VIEW_ETAT, environment)
        this.displayAxes = data.displayAxes || []
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
    impactAxeNomCourt(nomComplet) {
      return impactAxeNomCourtFromTaxonomy(nomComplet)
    },
    scrollToAxe(axeName) {
      const id = 'axe-' + impactAxeNameToSlug(axeName)
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
    goAccueil() {
      const isStaging = window.location.pathname.includes('/staging')
      this.$router.push({ name: homeRouteName(isStaging) }).catch(() => {})
    },
    goToAxeDetail(axeName) {
      const isStaging = window.location.pathname.includes('/staging')
      this.$router.push({
        name: etatEnvironnementRouteName(isStaging),
        query: { section: impactAxeNameToSlug(axeName) }
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
  min-width: 0;
  max-width: 100%;
  overflow-wrap: break-word;
  word-wrap: break-word;
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
  flex-wrap: wrap;
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
  max-width: 100%;
  overflow-wrap: break-word;
}

/* Callout */
.etat-callout {
  background: #f6f6f6;
  border-left: 4px solid #6a6af4;
  padding: 1.25rem 1.5rem;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.etat-callout-title {
  margin: 0 0 0.5rem;
}

.etat-callout-text {
  color: #3a3a3a;
  margin: 0;
  overflow-wrap: break-word;
}

.etat-axe-content {
  margin-top: 0.5rem;
  min-width: 0;
  max-width: 100%;
}

.etat-axe-content .etat-axe-description {
  margin-bottom: 1rem;
}

/* Quick access links - same structure as Chantiers Sectoriels (label + links on 2 lines) */
.etat-quick-access {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem 0;
  max-width: 100%;
  min-width: 0;
}

.etat-quick-label {
  font-size: 0.875rem;
  color: #3a3a3a;
}

.etat-quick-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  max-width: 100%;
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
  white-space: normal;
  text-align: center;
  max-width: 100%;
  overflow-wrap: anywhere;
  box-sizing: border-box;
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
  flex-wrap: wrap;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 0.5rem;
  min-width: 0;
  max-width: 100%;
}

.etat-axe-title {
  margin: 0;
  min-width: 0;
  max-width: 100%;
  overflow-wrap: break-word;
}

.etat-axe-title-link {
  display: inline;
  max-width: 100%;
  color: #000091;
  text-decoration: none;
  transition: color 0.15s;
}

.etat-axe-title-text {
  overflow-wrap: break-word;
  word-break: normal;
}

.etat-axe-title-arrow {
  display: inline-block;
  margin-left: 0.35em;
  vertical-align: middle;
  line-height: 1;
  font-size: 1rem;
}

.etat-axe-title-link:hover,
.etat-axe-title-link:focus {
  color: #1212ff;
}

.etat-axe-stats {
  font-size: 0.8125rem;
  color: #666;
  white-space: nowrap;
}

.etat-axe-description {
  color: #3a3a3a;
  margin-bottom: 1rem;
  max-width: 100%;
  overflow-wrap: break-word;
}

/* Table */
.etat-table-wrapper {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
  margin-bottom: 1rem;
}

.etat-table {
  width: max-content;
  min-width: 100%;
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
  width: 32%;
  min-width: 160px;
}

.col-indicateur {
  width: 30%;
  min-width: 140px;
}

.col-valeurs {
  width: 38%;
  min-width: 220px;
}

.etat-table thead .col-valeurs {
  vertical-align: middle;
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
  overflow-wrap: break-word;
  word-break: normal;
}

.td-valeurs {
  padding: 0.75rem 0.5rem !important;
  min-height: 160px;
  height: auto;
  vertical-align: middle !important;
  overflow: visible;
}

/* Séparateur de groupe (« secteur - X », « secteur - Transverse », « indicateurs - Autres ») */
.etat-autres-row .td-autres-title {
  padding: 0.75rem 0.5rem !important;
  background: #f6f6f6;
  color: #555;
  font-weight: 700;
  font-size: 0.875rem;
  border-top: 2px solid #ddd;
}

.td-indicateur {
  color: #3a3a3a;
  line-height: 1.5;
  overflow-wrap: break-word;
  word-break: normal;
}

.source-link-icon {
  background-image: none;
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

/* Desktop : tableau sur toute la largeur, pas de scroll horizontal ; graphiques qui remplissent la colonne Valeurs */
@media (min-width: 992px) {
  .etat-table-wrapper {
    overflow-x: visible;
    width: 100%;
  }

  .etat-table {
    width: 100%;
    table-layout: fixed;
    min-width: 0;
  }

  .col-engagement,
  .col-indicateur,
  .col-valeurs {
    min-width: 0;
  }

  .td-valeurs {
    vertical-align: top !important;
    min-height: 180px;
  }
}

/* Mobile / tablette : colonnes compactes ; pas de hauteur max (scroll vertical = page) */
@media (max-width: 991px) {
  .etat-table th,
  .etat-table td {
    box-sizing: border-box;
  }

  .etat-table .col-engagement,
  .etat-table .td-engagement,
  .etat-table .col-indicateur,
  .etat-table .td-indicateur {
    max-width: 80vw;
    overflow-wrap: break-word;
    word-break: normal;
  }

  .etat-table-wrapper {
    overflow-x: auto;
    overflow-y: visible;
    max-height: none;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;
  }

  .etat-table thead th {
    position: sticky;
    top: 0;
    z-index: 2;
    background-color: #f6f6f6;
    box-shadow: 0 1px 0 #d6d6d6;
  }

  .col-engagement {
    min-width: 6.75rem;
  }

  .col-indicateur {
    min-width: 6.5rem;
  }

  .col-valeurs {
    min-width: 9.5rem;
  }

  .td-valeurs {
    min-height: 7.5rem;
    vertical-align: top !important;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .etat-axe-header {
    flex-direction: column;
    gap: 0.25rem;
  }

  .etat-axe-stats {
    white-space: normal;
  }

  .etat-callout {
    padding: 1rem 1rem;
  }

  .td-indicateur-legend-item {
    white-space: normal;
  }

  .etat-table th,
  .etat-table td {
    padding: 0.5rem 0.625rem;
  }

  .etat-table {
    font-size: 0.8125rem;
  }

  .col-engagement {
    min-width: 6.25rem;
  }

  .col-indicateur {
    min-width: 6rem;
  }
}
</style>
