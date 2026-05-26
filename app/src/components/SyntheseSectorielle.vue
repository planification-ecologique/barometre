<template>
  <div class="synthese-sectorielle">
    <!-- Breadcrumb -->
    <nav class="fr-breadcrumb" aria-label="vous êtes ici :">
      <ol class="fr-breadcrumb__list">
        <li>
          <router-link class="fr-breadcrumb__link" :to="accueilTo">Accueil</router-link>
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
        Les "chantiers" structurent les transformations tangibles prévues par les stratégies environnementales 
        afin d'atteindre les objectifs visés en matière d'état de l'environnement. 
        L'ensemble des chantiers sont listés ci-dessous, regroupés par secteur, avec le ou 
        les indicateurs permettant de suivre leur mise en œuvre. Chaque chantier se décompose en "leviers", 
        plus concrets, présentés dans la fiche du chantier.
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
                <th class="col-valeurs">
                  <synthesis-valeurs-header-legend :indicators="sectorHeaderLegendIndicators(sector)" />
                </th>
              </tr>
            </thead>
            <tbody
              v-for="chantier in sector.chantiers"
              :key="chantier.name"
              class="chantier-group"
            >
              <tr
                v-for="(indicator, idx) in chantier.indicators"
                :key="chantier.name + '-' + idx"
                :class="{ 'first-row-of-chantier': idx === 0 }"
                class="clickable-row"
                @click="handleRowClick($event, sector.name, chantier)"
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
                        :key="'eng-' + chantier.name + '-' + eIdx"
                        class="chantier-engagement-badge-slot"
                      >
                        <router-link
                          v-if="axeBadgeTo(eng)"
                          :to="axeBadgeTo(eng)"
                          class="engagement-badge engagement-badge--link"
                          :data-tooltip="truncateEngagement(eng) !== eng ? eng : undefined"
                          :aria-label="eng || undefined"
                          @click.native.stop
                        >
                          {{ truncateEngagement(eng) }}
                        </router-link>
                        <span
                          v-else
                          class="engagement-badge"
                          :data-tooltip="truncateEngagement(eng) !== eng ? eng : undefined"
                          :aria-label="eng || undefined"
                          @click.stop
                        >
                          {{ truncateEngagement(eng) }}
                        </span>
                      </span>
                      <span
                        v-if="chantier.remainingEngagements > 0"
                        class="engagement-badge engagement-badge--more"
                        :data-tooltip="chantier.remainingEngagementNames || undefined"
                        :aria-label="chantier.remainingEngagementNames || undefined"
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
                @click="handleRowClick($event, sector.name, chantier)"
              >
                <td class="td-chantier">
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
                      :key="'eng-e-' + chantier.name + '-' + eIdx"
                      class="chantier-engagement-badge-slot"
                    >
                      <router-link
                        v-if="axeBadgeTo(eng)"
                        :to="axeBadgeTo(eng)"
                        class="engagement-badge engagement-badge--link"
                        :data-tooltip="truncateEngagement(eng) !== eng ? eng : undefined"
                        :aria-label="eng || undefined"
                        @click.native.stop
                      >
                        {{ truncateEngagement(eng) }}
                      </router-link>
                      <span
                        v-else
                        class="engagement-badge"
                        :data-tooltip="truncateEngagement(eng) !== eng ? eng : undefined"
                        :aria-label="eng || undefined"
                        @click.stop
                      >
                        {{ truncateEngagement(eng) }}
                      </span>
                    </span>
                    <span
                      v-if="chantier.remainingEngagements > 0"
                      class="engagement-badge engagement-badge--more"
                      :data-tooltip="chantier.remainingEngagementNames || undefined"
                      :aria-label="chantier.remainingEngagementNames || undefined"
                      @click.stop
                    >
                      +{{ chantier.remainingEngagements }}
                    </span>
                  </div>
                </td>
                <td class="td-indicateur td-empty" colspan="2">
                  <p>Pas d'indicateur disponible</p>
                  <p class="td-empty-message">L'indicateur n'est pas encore défini ou les données ne sont pas encore disponibles.</p>
                </td>
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
import SynthesisValeursHeaderLegend from './SynthesisValeursHeaderLegend.vue'
import { getNavigationStructure, getIndicators, isImpactAxe } from '@/services/csvDataService.js'
import { getAllColors, getHexaFromName } from '@/utils.js'
import { chantiersRouteName, etatEnvironnementRouteName } from '@/config/routeNames.js'
import { toSectionSlug } from '@/utils/sectionUrl.js'
import {
  impactAxeNameToSlug,
  resolveImpactAxeCanonicalFromLabel,
} from '@/utils/impactAxeUrl.js'

const SECTOR_DESCRIPTIONS = {
  'Consommer': 'Le secteur "Consommer" traite de l\'économie circulaire, de la réduction des déchets et de la transformation des modes de consommation vers plus de sobriété.',
  'Préserver': 'Le secteur "Préserver" concerne la préservation des espaces naturels et des ressources en eaux',
  'Produire': 'Le secteur "Produire" concerne la décarbonation de l\'industrie, le développement des énergies renouvelables et la transformation des procédés industriels.',
  'Se déplacer': 'Le secteur "Se déplacer" couvre les déplacements de voyageurs et de marchandises, pour l\'ensemble des modes de transports (terrestres, aériens, maritimes et fluviaux).',
  'Se loger': 'Le secteur "Se loger" traite du bâtiment : rénovation énergétique, construction et exploitations durables ainsi que prévention et protection contre les risques.',
  'Se nourrir': 'Le secteur "Se nourrir" couvre l\'ensemble de la chaîne alimentaire, de la production agricole à la consommation, en passant par la transformation et la distribution.'
}

export default {
  name: 'SyntheseSectorielle',
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
      navigationData: null,
      displaySectors: [],
      indicatorDataCache: {}
    }
  },
  async mounted() {
    await this.loadData()
  },
  computed: {
    accueilTo() {
      return { path: this.useStaging ? '/staging' : '/' }
    },
  },
  watch: {
    '$route.hash'() {
      this.$nextTick(() => this.scrollToHash())
    },
  },
  methods: {
    sourceUrl(rawData) {
      return rawData?.lien_donnees_source || rawData?.lien_site_source || ''
    },
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
          const chantierEntries = Object.entries(sector.chantiers || {}).filter(
            ([name]) => !isImpactAxe(name)
          )

          let levierCount = 0

          for (const [chantierName, chantierData] of chantierEntries) {
            const levierNames = Object.keys(chantierData.leviers || {})
              .filter(l => l !== 'Indicateur de chantier' && l !== 'Autres indicateurs' && l !== "Indicateur d'impact - autres")

            levierCount += levierNames.length

            // Get the "Indicateur de chantier" items
            const chantierIndicators = chantierData.leviers['Indicateur de chantier'] || []
            const gristIds = chantierIndicators.map(item => item.gristId).filter(Boolean)
            allGristIds.push(...gristIds)

            // Build badges from Axe taxonomie (Liste_chantiers), fallback to empty if not found
            const axeTaxonomie = chantierData.axeTaxonomie || []
            const maxVisible = 4
            const visibleBadges = axeTaxonomie.slice(0, maxVisible)
            const remainingNames = axeTaxonomie.slice(maxVisible)

            chantiers.push({
              name: chantierName,
              id: chantierName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
              gristIds,
              engagementBadges: visibleBadges,
              remainingEngagements: remainingNames.length,
              remainingEngagementNames: remainingNames.join('\n'),
              indicators: [], // Will be populated after data fetch
              sortedLeviers: chantierData.sortedLeviers || []
            })
          }

          sectorStructures.push({
            name: sector.name,
            description: SECTOR_DESCRIPTIONS[sector.name] || '',
            chantierCount: chantierEntries.length,
            levierCount,
            engagementLabel: 'Axe de la taxonomie',
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
        this.$nextTick(() => this.scrollToHash())
      }
    },
    scrollToHash() {
      const hash = this.$route?.hash
      if (!hash || !hash.startsWith('#sector-')) return
      const id = hash.slice(1)
      const maxAttempts = 30
      const tryScroll = (attempt) => {
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          return
        }
        if (attempt < maxAttempts) {
          requestAnimationFrame(() => tryScroll(attempt + 1))
        }
      }
      this.$nextTick(() => tryScroll(0))
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

      // Légende avec couleurs pour les graphes non mono-barre (Barres empilées, Courbes indépendantes, Barres simple multi-séries)
      let legendItems = [];
      const chartType = indicator.type_de_graphique || 'Barres simple';
      const palette = getAllColors();

      if (chartType === 'Barres empilées' || chartType === 'Courbes indépendantes') {
        const sg = indicator.label_sous_groupe;
        const labels = Array.isArray(sg) && sg.length > 1 ? sg.filter(Boolean) : [];
        legendItems = labels.map((lbl, i) => ({
          label: lbl,
          color: getHexaFromName(palette[i] || palette[0])
        }));
      } else if (chartType === 'Barres simple' && indicator.values?.legend) {
        const leg = indicator.values.legend;
        const colors = indicator.values?.colors;
        if (Array.isArray(leg) && leg.length > 1) {
          legendItems = leg.filter(Boolean).map((lbl, i) => {
            const c = Array.isArray(colors) && colors[i]
              ? (typeof colors[i] === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(colors[i]) ? colors[i] : getHexaFromName(colors[i]))
              : getHexaFromName(palette[i] || palette[0]);
            return { label: String(lbl), color: c };
          });
        }
      }

      return {
        label: labelBase,
        labelUnit: unit || '',
        legendItems,
        values,
        targetValue,
        ecart,
        description,
        id: indicator.id_indic,
        rawData: indicator
      }
    },
    sectorHeaderLegendIndicators (sector) {
      const raw = []
      for (const chantier of sector?.chantiers || []) {
        for (const indicator of chantier?.indicators || []) {
          if (indicator?.rawData) raw.push(indicator.rawData)
        }
      }
      return raw
    },
    truncateEngagement(text) {
      if (!text || typeof text !== 'string') return ''
      // Truncate to 80Fo characters
      const maxLen = 80
      if (text.length <= maxLen) return text
      return text.slice(0, maxLen) + '…'
    },
    /** Route état de l’environnement pour un badge d’axe taxonomie, ou null */
    axeBadgeTo(eng) {
      const canonical = resolveImpactAxeCanonicalFromLabel(eng)
      if (!canonical) return null
      return {
        name: etatEnvironnementRouteName(this.useStaging),
        query: { section: impactAxeNameToSlug(canonical) },
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
    chantierHref(sectorName, chantier) {
      const isStaging = window.location.pathname.includes('/staging')
      const route = this.$router.resolve({
        name: chantiersRouteName(isStaging),
        query: {
          section: toSectionSlug(sectorName),
          chantier_id: chantier.id
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
    handleRowClick(event, sectorName, chantier) {
      if (event.ctrlKey || event.metaKey || event.button === 1) {
        return
      }
      event.preventDefault()
      this.goToChantier(sectorName, chantier)
    },
    goToChantier(sectorName, chantier) {
      const isStaging = window.location.pathname.includes('/staging')
      this.$router.push({
        name: chantiersRouteName(isStaging),
        query: {
          section: toSectionSlug(sectorName),
          chantier_id: chantier.id
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
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
  margin-bottom: 1rem;
}

.synthese-table {
  width: max-content;
  min-width: 100%;
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
}

.synthese-table thead .col-valeurs {
  vertical-align: middle;
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

/* Highlight entire chantier block on hover (grouped, not per-row) */
.chantier-group:hover tr {
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

/* Wrapper clé v-for (Vue 2 : pas de :key sur <template>) — ne casse pas le flex */
.chantier-engagement-badge-slot {
  display: contents;
}

.engagement-badge {
  display: inline-block;
  max-width: 25em;
  background: #e3e3fd;
  color: #000091;
  font-size: 0.6875rem;
  font-weight: 500;
  padding: 0.2rem 0.625rem;
  border-radius: 999px;
  line-height: 1.4;
  vertical-align: baseline;
  white-space: normal;
  word-break: break-word;
  transition: background-color 0.15s, color 0.15s;
  position: relative;
}

.engagement-badge:hover {
  background: #000091;
  color: #fff;
  /* Keep size fixed to avoid layout shift and hover flash */
}

a.engagement-badge--link {
  text-decoration: none;
  color: #000091;
}

a.engagement-badge--link:hover,
a.engagement-badge--link:focus {
  color: #fff;
}

.engagement-badge--more {
  background: #f0f0f0;
  color: #666;
  cursor: help !important;
  border-radius: 999px;
  position: relative;
  z-index: 10;
}

/* Custom tooltip for all badges (appears immediately, avoids native title delay and overflow clipping) */
.engagement-badge[data-tooltip]:hover::after {
  content: attr(data-tooltip);
  display: block;
  position: absolute;
  bottom: calc(100% + 0.5rem);
  left: 50%;
  transform: translateX(-50%);
  width: max-content;
  max-width: min(280px, 90vw);
  min-width: 12rem;
  background: #1e1e1e;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 400;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  white-space: normal;
  overflow-wrap: break-word;
  word-break: normal;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 10000;
  pointer-events: none;
  line-height: 1.4;
}

/* +X badge: one engagement per line in tooltip */
.engagement-badge--more[data-tooltip]:hover::after {
  white-space: pre-line;
}

.td-valeurs {
  padding: 0.75rem 0.5rem !important;
  min-height: 160px;
  height: auto;
  vertical-align: middle !important;
  overflow: visible;
  text-align: center;
}

.td-indicateur {
  color: #3a3a3a;
  line-height: 1.4;
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
.synthese-loading {
  padding: 2rem;
  text-align: center;
  color: #666;
}

/* Mobile / tablette : les deux premières colonnes ne dépassent pas 80 % de la largeur d’écran */
@media (max-width: 991px) {
  .synthese-table th,
  .synthese-table td {
    box-sizing: border-box;
  }

  .synthese-table .col-chantier,
  .synthese-table .td-chantier,
  .synthese-table .col-indicateur,
  .synthese-table .td-indicateur {
    max-width: 80vw;
    overflow-wrap: break-word;
    word-break: normal;
  }

  .col-chantier {
    min-width: 6.75rem;
  }

  .col-indicateur {
    min-width: 6.5rem;
  }

  .col-valeurs {
    min-width: 9.5rem;
  }
}

@media (min-width: 992px) {
  .synthese-table-wrapper {
    overflow-x: visible;
    width: 100%;
  }

  .synthese-table {
    width: 100%;
    table-layout: fixed;
    min-width: 0;
  }

  .col-chantier,
  .col-indicateur,
  .col-valeurs {
    min-width: 0;
  }

  .td-valeurs {
    vertical-align: top !important;
    min-height: 180px;
  }
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

  .col-chantier {
    min-width: 6.25rem;
  }

  .col-indicateur {
    min-width: 6rem;
  }
}
</style>
