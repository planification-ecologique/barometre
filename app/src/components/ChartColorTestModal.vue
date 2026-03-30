<template>
  <div
    v-if="chartColorModalOpen"
    id="fr-chart-color-test-modal"
    class="chart-color-test-modal__backdrop"
    role="dialog"
    aria-modal="true"
    aria-labelledby="fr-chart-color-test-modal-title"
    tabindex="-1"
    @click.self="cancel"
    @keydown.esc.prevent="cancel"
  >
    <div class="fr-container fr-container--fluid fr-container-md chart-color-test-modal__panel-wrap">
      <div class="fr-grid-row fr-grid-row--center">
        <div class="fr-col-12 fr-col-xl-11">
          <div
            class="fr-modal__body fr-scroll-divider chart-color-test-modal__body fr-background-default--grey"
            @click.stop
          >
            <div class="fr-modal__header">
              <button
                type="button"
                aria-controls="fr-chart-color-test-modal"
                class="fr-btn fr-btn--close"
                title="Fermer sans enregistrer"
                @click="cancel"
              >
                Fermer
              </button>
            </div>
            <div class="fr-modal__content">
              <h1 id="fr-chart-color-test-modal-title" class="fr-modal__title fr-mb-2w">
                Tester les couleurs des graphiques
              </h1>
              <p class="fr-text--sm fr-mb-2w">
                Palette
                <a
                  href="https://www.systeme-de-design.gouv.fr/version-courante/fr/fondamentaux/couleurs-palette"
                  class="fr-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >DSFR</a>
                — une <strong>cible</strong> et les mêmes
                <strong>couleur 1, couleur 2, …</strong> pour tous les graphiques.
                Ajustez ci-dessous puis cliquez sur <strong>Valider</strong> pour enregistrer et actualiser la page.
              </p>

              <section class="chart-color-test-modal__previews fr-mb-3w" aria-label="Aperçus">
                <h2 class="fr-h5 fr-mb-1w">Aperçu</h2>
                <p class="fr-text--xs fr-text-mention--grey fr-mb-2w">
                  Données factices : barres simples (une seule couleur / série, tendance, cible sans barre en 2030), barres empilées, courbes (trait plein puis pointillé).
                </p>
                <div class="fr-grid-row fr-grid-row--gutters">
                  <div class="fr-col-12 fr-col-md-4">
                    <p class="fr-text--xs fr-text--bold fr-mb-1v">Barres simples</p>
                    <div class="chart-color-test-modal__mini-wrap">
                      <bar-chart
                        :key="'pv1-' + previewRenderKey"
                        :is-small="true"
                        :x="previewSimpleX"
                        :y="previewSimpleY"
                        :name="previewSimpleName"
                        :horizontal="false"
                        :stacked="true"
                        :color="previewSimpleColorsJson"
                        :aspectratio="2.2"
                        :axis-font-size="9"
                        :point-radius="2"
                        :trendline="previewSimpleTrendJson"
                        :target-trajectory="previewSimpleTargetTraj"
                        :preview-target-token="previewTargetTokenStr"
                      />
                    </div>
                  </div>
                  <div class="fr-col-12 fr-col-md-4">
                    <p class="fr-text--xs fr-text--bold fr-mb-1v">Barres empilées (5 couleurs)</p>
                    <div class="chart-color-test-modal__mini-wrap">
                      <bar-chart
                        :key="'pv2-' + previewRenderKey"
                        :is-small="true"
                        :x="previewStackedX"
                        :y="previewStackedY"
                        :name="previewStackedName"
                        :horizontal="false"
                        :stacked="true"
                        :color="previewStackedColorsJson"
                        :aspectratio="2.2"
                        :axis-font-size="9"
                        :point-radius="2"
                      />
                    </div>
                  </div>
                  <div class="fr-col-12 fr-col-md-4">
                    <p class="fr-text--xs fr-text--bold fr-mb-1v">Courbes indépendantes (4)</p>
                    <div class="chart-color-test-modal__mini-wrap">
                      <multi-line-chart
                        :key="'pv3-' + previewRenderKey"
                        :is-small="true"
                        :x="previewLineX"
                        :y="previewLineY"
                        :name="previewLineName"
                        :color="previewLineColorsJson"
                        :pointopacity="previewLinePointOpacityJson"
                        :aspectratio="2.2"
                        :axis-font-size="9"
                        :point-radius="2"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section class="chart-color-test-modal__presets fr-mb-3w" aria-label="Ensembles de couleurs">
                <h2 class="fr-h5 fr-mb-1w">Ensembles prédéfinis</h2>
                <p class="fr-text--xs fr-text-mention--grey fr-mb-2w">
                  Appliquent la cible et les huit premières couleurs de série sur le brouillon. Une retouche manuelle désactive l’ensemble sélectionné.
                </p>
                <div class="fr-btns-group fr-btns-group--inline fr-btns-group--left fr-btns-group--sm">
                  <button
                    type="button"
                    class="fr-btn"
                    :class="draft.activePresetId === CHART_COLOR_INITIAL_PRESET_ID ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline'"
                    title="Aucune couleur imposée par la modale : repli du code (barres bleu France / vert émeraude, cible bleu écume, palette DSFR en rotation pour le reste)."
                    @click="applyPresetToDraft(CHART_COLOR_INITIAL_PRESET_ID)"
                  >
                    Couleurs initiales
                  </button>
                  <button
                    v-for="preset in CHART_COLOR_PRESETS"
                    :key="preset.id"
                    type="button"
                    class="fr-btn"
                    :class="draft.activePresetId === preset.id ? 'fr-btn--secondary' : 'fr-btn--tertiary-no-outline'"
                    :title="preset.hint || ''"
                    @click="applyPresetToDraft(preset.id)"
                  >
                    {{ preset.label }}
                  </button>
                  <button
                    type="button"
                    class="fr-btn fr-btn--tertiary-no-outline"
                    title="Tirer au hasard une cible et huit couleurs de série distinctes (palette DSFR complète)"
                    aria-label="Appliquer un groupe de couleurs aléatoire au brouillon"
                    @click="randomizeDraftColors"
                  >
                    Aléatoire
                  </button>
                </div>
              </section>

              <section class="chart-color-test-modal__targets fr-mb-3w" aria-label="Éléments à recolorer">
                <h2 class="fr-h5 fr-mb-1w">Cible et couleurs de série</h2>
                <p class="fr-text--xs fr-text-mention--grey fr-mb-2w">
                  Carte sélectionnée : bordure bleue. Astérisque * = réglage personnalisé (hors ensemble actif).
                </p>

                <div
                  v-for="group in targetGroups"
                  :key="group.id"
                  class="chart-color-test-modal__target-section fr-mb-2w"
                >
                  <h3 class="fr-text--sm fr-text--bold fr-mb-1v">{{ group.title }}</h3>
                  <p v-if="group.hint" class="fr-text--xs fr-text-mention--grey fr-mb-1w">{{ group.hint }}</p>
                  <div class="chart-color-test-modal__target-grid">
                    <button
                      v-for="t in group.targets"
                      :key="t.role"
                      type="button"
                      class="chart-color-test-modal__target-tile"
                      :class="{ 'chart-color-test-modal__target-tile--active': activeRole === t.role }"
                      :aria-pressed="activeRole === t.role ? 'true' : 'false'"
                      :aria-label="`Sélectionner ${t.label}, couleur actuelle ${t.token}`"
                      @click="setActiveRole(t.role)"
                    >
                      <span
                        class="chart-color-test-modal__target-tile-swatch"
                        :style="{ backgroundColor: t.hex }"
                        aria-hidden="true"
                      />
                      <span class="chart-color-test-modal__target-tile-label">{{ t.label }}</span>
                      <span v-if="t.detail" class="chart-color-test-modal__target-tile-detail">{{ t.detail }}</span>
                      <code class="chart-color-test-modal__target-tile-token">{{ t.token }}</code>
                      <span v-if="t.customized" class="chart-color-test-modal__star" title="Personnalisé">*</span>
                    </button>
                  </div>
                </div>

                <p class="fr-text--sm fr-mb-1w" aria-live="polite">
                  <strong>En cours :</strong> {{ activeRoleLabel }} — <code>{{ activeRoleDescription }}</code>
                </p>
                <div class="fr-btns-group fr-btns-group--inline fr-btns-group--left">
                  <button type="button" class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm" @click="clearActiveRoleDraft">
                    Défaut pour cette carte
                  </button>
                  <button type="button" class="fr-btn fr-btn--secondary fr-btn--sm" @click="resetDraft">
                    Tout réinitialiser
                  </button>
                </div>
              </section>

              <section class="chart-color-test-modal__palette-section fr-mb-0" aria-label="Palette complète">
                <h2 class="fr-h5 fr-mb-1w">Toutes les couleurs</h2>
                <div class="fr-input-group fr-mb-2w">
                  <label class="fr-label" for="chart-color-test-filter">Filtrer (masque les familles vides)</label>
                  <input
                    id="chart-color-test-filter"
                    v-model.trim="filter"
                    class="fr-input"
                    type="search"
                    autocomplete="off"
                    placeholder="ex. blue-france, marianne, grey-…"
                  />
                </div>

                <div
                  v-for="cat in visibleCategories"
                  :key="cat"
                  class="chart-color-test-modal__palette-block fr-mb-2w"
                >
                  <h4 class="chart-color-test-modal__palette-heading fr-text--xs fr-text--bold fr-mb-1v">
                    {{ categoryLabels[cat] || cat }}
                    <span class="fr-text-mention--grey fr-text--xs">({{ filteredTokensForCategory(cat).length }})</span>
                  </h4>
                  <div class="chart-color-test-modal__chip-grid">
                    <button
                      v-for="token in filteredTokensForCategory(cat)"
                      :key="cat + '-' + token"
                      type="button"
                      class="chart-color-test-modal__chip-sq"
                      :class="{ 'chart-color-test-modal__chip-sq--current': isSelected(token) }"
                      :title="token"
                      :aria-label="'Appliquer la couleur ' + token + ' à ' + activeRoleLabel"
                      :style="{ backgroundColor: paletteMap[token].default }"
                      @click="selectDraft(token)"
                    />
                  </div>
                </div>
              </section>

              <div class="chart-color-test-modal__actions">
                <ul class="fr-btns-group fr-btns-group--inline fr-btns-group--right fr-btns-group--lg fr-mb-0">
                  <li>
                    <button type="button" class="fr-btn fr-btn--secondary" @click="cancel">
                      Annuler
                    </button>
                  </li>
                  <li>
                    <button type="button" class="fr-btn" @click="validate">
                      Valider
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BarChart from '@/components/components_dsfr/BarChart.vue'
import MultiLineChart from '@/components/components_dsfr/MultiLineChart.vue'
import {
  DSFR_PALETTE_MAP,
  DSFR_PALETTE_CATEGORY_ORDER,
  DSFR_PALETTE_CATEGORY_LABELS,
  DSFR_PALETTE_CATEGORIES
} from '@/config/dsfrChartPalette.js'
import {
  chartColorTestState,
  CHART_COLOR_INITIAL_PRESET_ID,
  CHART_COLOR_PRESETS,
  CHART_COLOR_TEST_MAX_SERIES,
  getDefaultSeriesPaletteToken
} from '@/services/chartColorTestOverrides.js'
import { getAllColors, getHexaFromName } from '@/utils.js'

const DEFAULT_TARGET = 'blue-ecume'

// Aperçu factice : une seule série en couleur 1 (pas de 2e série / 2e couleur) ; pas de barre en 2030 ; cible = trajectoire seule.
const PREVIEW_SIMPLE_X = [['2019', '2020', '2021', '2022', '2023', '2024', '2030']]
const PREVIEW_SIMPLE_Y = [
  [28, 30, 33, 35, 37, 39, null]
]
const PREVIEW_SIMPLE_LEGEND = ['Indicateur']
const PREVIEW_SIMPLE_TREND = JSON.stringify([null, null, null, 34.5, 36.5, 38.5, null])
const PREVIEW_SIMPLE_TARGET_TRAJ = JSON.stringify({
  points: [
    { year: '2024', value: 39, isTarget: false },
    { year: '2030', value: 48, isTarget: true }
  ]
})

const PREVIEW_STACK_DATE = [['2019', '2020', '2021', '2022', '2023']]
const PREVIEW_STACK_VALUES = [
  [12, 13, 14, 15, 16],
  [10, 10, 11, 11, 12],
  [8, 8, 9, 9, 10],
  [6, 6, 7, 7, 8],
  [4, 5, 5, 6, 6]
]
const PREVIEW_STACK_LABELS = ['A', 'B', 'C', 'D', 'E']

const PREVIEW_LINE_DATE = [['2018', '2019', '2020', '2021', '2022', '2023']]
const PREVIEW_LINE_VALUES = [
  [12, 14, 15, 16, 17, 18],
  [20, 19, 18, 17, 16, 15],
  [8, 9, 10, 11, 12, 13],
  [5, 6, 7, 8, 9, 10]
]
const PREVIEW_LINE_LABELS = ['Alpha', 'Beta', 'Gamma', 'Delta']
// Opacité par point : segments vers les 4 premiers points = pleins, puis pointillés si alpha < 1 — cf. MultiLineChart afterDatasetDraw.
const PREVIEW_LINE_POINT_OPACITY = JSON.stringify([
  [1, 1, 1, 1, 0.6, 0.6],
  [1, 1, 1, 1, 0.6, 0.6],
  [1, 1, 1, 1, 0.6, 0.6],
  [1, 1, 1, 1, 0.6, 0.6]
])

function cloneDraftFromGlobal () {
  return {
    targetToken: chartColorTestState.targetToken,
    seriesByIndex: { ...chartColorTestState.seriesByIndex },
    activePresetId: chartColorTestState.activePresetId
  }
}

function effectiveSeriesFromDraft (draft, index) {
  const key = String(index)
  const v = draft.seriesByIndex[key]
  return v || getDefaultSeriesPaletteToken(index)
}

function effectiveTargetFromDraft (draft) {
  return draft.targetToken || DEFAULT_TARGET
}

function parseActiveRole (role) {
  if (!role || role === 'target') return { kind: 'target' }
  const s = String(role)
  if (s.startsWith('series-')) {
    const index = parseInt(s.slice(7), 10)
    return { kind: 'series', index: Number.isNaN(index) ? 0 : index }
  }
  return { kind: 'target' }
}

function seriesRoleDetail (index) {
  if (index === 0) return 'Historique ou 1re série'
  if (index === 1) return 'Extrapolation ou 2e série'
  return `${index + 1}e série`
}

/** Mélange Fisher–Yates (copie mutable du tableau passé). */
function shuffleInPlace (arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = arr[i]
    arr[i] = arr[j]
    arr[j] = t
  }
  return arr
}

export default {
  name: 'ChartColorTestModal',
  components: { BarChart, MultiLineChart },
  data () {
    return {
      filter: '',
      activeRole: 'target',
      draft: cloneDraftFromGlobal(),
      paletteMap: DSFR_PALETTE_MAP,
      categoryOrder: DSFR_PALETTE_CATEGORY_ORDER,
      categoryLabels: DSFR_PALETTE_CATEGORY_LABELS,
      DSFR_PALETTE_CATEGORIES,
      CHART_COLOR_PRESETS,
      CHART_COLOR_INITIAL_PRESET_ID,
      chartColorTestState,
      previewSimpleX: JSON.stringify(PREVIEW_SIMPLE_X),
      previewSimpleY: JSON.stringify(PREVIEW_SIMPLE_Y),
      previewSimpleName: JSON.stringify(PREVIEW_SIMPLE_LEGEND),
      previewSimpleTrendJson: PREVIEW_SIMPLE_TREND,
      previewSimpleTargetTraj: PREVIEW_SIMPLE_TARGET_TRAJ,
      previewStackedX: JSON.stringify(PREVIEW_STACK_DATE),
      previewStackedY: JSON.stringify(PREVIEW_STACK_VALUES),
      previewStackedName: JSON.stringify(PREVIEW_STACK_LABELS),
      previewLineX: JSON.stringify(PREVIEW_LINE_DATE),
      previewLineY: JSON.stringify(PREVIEW_LINE_VALUES),
      previewLineName: JSON.stringify(PREVIEW_LINE_LABELS),
      previewLinePointOpacityJson: PREVIEW_LINE_POINT_OPACITY
    }
  },
  computed: {
    chartColorModalOpen () {
      return chartColorTestState.modalOpen
    },
    previewRenderKey () {
      return JSON.stringify({
        t: this.draft.targetToken,
        s: this.draft.seriesByIndex,
        a: this.draft.activePresetId
      })
    },
    previewSimpleColorsJson () {
      this.draft.seriesByIndex
      this.draft.targetToken
      return JSON.stringify([effectiveSeriesFromDraft(this.draft, 0)])
    },
    previewStackedColorsJson () {
      this.draft.seriesByIndex
      const arr = []
      for (let i = 0; i < 5; i++) arr.push(effectiveSeriesFromDraft(this.draft, i))
      return JSON.stringify(arr)
    },
    previewLineColorsJson () {
      this.draft.seriesByIndex
      const arr = []
      for (let i = 0; i < 4; i++) arr.push(effectiveSeriesFromDraft(this.draft, i))
      return JSON.stringify(arr)
    },
    previewTargetTokenStr () {
      return effectiveTargetFromDraft(this.draft)
    },
    seriesIdx () {
      return Array.from({ length: CHART_COLOR_TEST_MAX_SERIES }, (_, i) => i)
    },
    targetGroups () {
      this.draft.targetToken
      this.draft.seriesByIndex
      this.draft.activePresetId

      const tokTarget = effectiveTargetFromDraft(this.draft)

      const seriesTargets = this.seriesIdx.map((index) => {
        const token = effectiveSeriesFromDraft(this.draft, index)
        const presetActive = !!this.draft.activePresetId
        const customized = !presetActive && !!this.draft.seriesByIndex[String(index)]
        return {
          role: `series-${index}`,
          label: `Couleur ${index + 1}`,
          detail: seriesRoleDetail(index),
          token,
          hex: getHexaFromName(token),
          customized
        }
      })

      const targetCustomized = !this.draft.activePresetId && this.draft.targetToken != null

      return [
        {
          id: 'target',
          title: 'Cible',
          hint: 'Trajectoire et segments objectifs (ligne pointillée).',
          targets: [
            {
              role: 'target',
              label: 'Cible',
              detail: 'Trajectoire',
              token: tokTarget,
              hex: getHexaFromName(tokTarget),
              customized: targetCustomized
            }
          ]
        },
        {
          id: 'series',
          title: 'Couleurs de série',
          hint: 'Même numéro pour toutes les cartes. Sans personnalisation, la couleur 1 est le vert bourgeon (palette DSFR), la 2 le bleu France, etc. — barres simples, empilées et courbes.',
          targets: seriesTargets
        }
      ]
    },
    activeRoleLabel () {
      for (const g of this.targetGroups) {
        const t = g.targets.find((x) => x.role === this.activeRole)
        if (t) return `${g.title} — ${t.label}`
      }
      return this.activeRole
    },
    activeRoleDescription () {
      const p = parseActiveRole(this.activeRole)
      let token
      if (p.kind === 'series') token = effectiveSeriesFromDraft(this.draft, p.index)
      else token = effectiveTargetFromDraft(this.draft)
      return `${token} (${getHexaFromName(token)})`
    },
    visibleCategories () {
      this.filter
      return this.categoryOrder.filter((cat) => this.filteredTokensForCategory(cat).length > 0)
    }
  },
  watch: {
    chartColorModalOpen: {
      immediate: true,
      handler (open) {
        if (open) {
          this.draft = cloneDraftFromGlobal()
          this.activeRole = 'target'
          this.filter = ''
          this.$nextTick(() => {
            const root = document.getElementById('fr-chart-color-test-modal')
            if (root && typeof root.focus === 'function') root.focus()
          })
        }
      }
    }
  },
  methods: {
    setActiveRole (role) {
      this.activeRole = role
    },
    applyPresetToDraft (presetId) {
      if (presetId === CHART_COLOR_INITIAL_PRESET_ID) {
        this.draft = {
          ...this.draft,
          targetToken: null,
          seriesByIndex: {},
          activePresetId: CHART_COLOR_INITIAL_PRESET_ID
        }
        return
      }
      const preset = CHART_COLOR_PRESETS.find((p) => p.id === presetId)
      if (!preset) return
      const next = {}
      const palette = getAllColors()
      for (let i = 0; i < CHART_COLOR_TEST_MAX_SERIES; i++) {
        next[String(i)] = String(preset.series[i] || palette[i % palette.length])
      }
      this.draft = {
        ...this.draft,
        seriesByIndex: next,
        targetToken: preset.target,
        activePresetId: presetId
      }
    },
    randomizeDraftColors () {
      const keys = Object.keys(this.paletteMap)
      const need = CHART_COLOR_TEST_MAX_SERIES + 1
      if (keys.length < need) return
      const shuffled = shuffleInPlace(keys.slice())
      const target = shuffled[0]
      const next = {}
      for (let i = 0; i < CHART_COLOR_TEST_MAX_SERIES; i++) {
        next[String(i)] = shuffled[1 + i]
      }
      this.draft = {
        ...this.draft,
        targetToken: target,
        seriesByIndex: next,
        activePresetId: null
      }
    },
    resetDraft () {
      this.draft = {
        targetToken: null,
        seriesByIndex: {},
        activePresetId: CHART_COLOR_INITIAL_PRESET_ID
      }
    },
    clearActiveRoleDraft () {
      const p = parseActiveRole(this.activeRole)
      if (p.kind === 'series') {
        const key = String(p.index)
        const next = { ...this.draft.seriesByIndex }
        delete next[key]
        this.draft = { ...this.draft, seriesByIndex: next, activePresetId: null }
      } else {
        this.draft = { ...this.draft, targetToken: null, activePresetId: null }
      }
    },
    selectDraft (token) {
      const p = parseActiveRole(this.activeRole)
      if (p.kind === 'series') {
        const key = String(p.index)
        this.draft = {
          ...this.draft,
          activePresetId: null,
          seriesByIndex: { ...this.draft.seriesByIndex, [key]: token }
        }
      } else {
        this.draft = {
          ...this.draft,
          activePresetId: null,
          targetToken: token
        }
      }
    },
    isSelected (token) {
      const par = parseActiveRole(this.activeRole)
      if (par.kind === 'series') return effectiveSeriesFromDraft(this.draft, par.index) === token
      return effectiveTargetFromDraft(this.draft) === token
    },
    validate () {
      chartColorTestState.commitModalDraft(this.draft)
      chartColorTestState.closeModal()
      window.location.reload()
    },
    cancel () {
      chartColorTestState.closeModal()
    },
    filteredTokensForCategory (cat) {
      const tokens = this.DSFR_PALETTE_CATEGORIES[cat] || []
      const q = (this.filter || '').toLowerCase()
      if (!q) return tokens
      return tokens.filter((t) => t.toLowerCase().includes(q))
    }
  }
}
</script>

<style scoped>
.chart-color-test-modal__backdrop {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  background-color: rgba(22, 22, 22, 0.48);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 1.5rem 1rem;
  box-sizing: border-box;
}
.chart-color-test-modal__panel-wrap {
  width: 100%;
  max-width: 100%;
  margin: 0 auto 2rem;
}
.chart-color-test-modal__body {
  --modal-max-height: min(92vh, 960px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  border-radius: 0.25rem;
}
.chart-color-test-modal__mini-wrap {
  width: 100%;
  min-width: 0;
  min-height: 130px;
  overflow: hidden;
  border: 1px solid var(--border-default-grey, #ddd);
  border-radius: 0.25rem;
  padding: 0.25rem;
  background: var(--background-default-grey, #fff);
}
.chart-color-test-modal__mini-wrap ::v-deep .widget_container {
  margin: 0 !important;
  padding: 0 !important;
}
.chart-color-test-modal__mini-wrap ::v-deep .r_col {
  padding: 0 !important;
  margin: 0 !important;
}
.chart-color-test-modal__mini-wrap ::v-deep .chart {
  padding: 0 !important;
  margin: 0 !important;
}
.chart-color-test-modal__mini-wrap ::v-deep .bar-chart-legend,
.chart-color-test-modal__mini-wrap ::v-deep .flex,
.chart-color-test-modal__mini-wrap ::v-deep .linechart_tooltip,
.chart-color-test-modal__mini-wrap ::v-deep .legende_dot,
.chart-color-test-modal__mini-wrap ::v-deep .legende_dash_line1,
.chart-color-test-modal__mini-wrap ::v-deep .legende_dash_line2,
.chart-color-test-modal__mini-wrap ::v-deep .legende_dot_circle,
.chart-color-test-modal__mini-wrap ::v-deep .fr-text--xs,
.chart-color-test-modal__mini-wrap ::v-deep .fr-text--sm,
.chart-color-test-modal__mini-wrap ::v-deep .fr-text--bold,
.chart-color-test-modal__mini-wrap ::v-deep .fr-mt-3v,
.chart-color-test-modal__mini-wrap ::v-deep .fr-mt-1w,
.chart-color-test-modal__mini-wrap ::v-deep .fr-mb-1v,
.chart-color-test-modal__mini-wrap ::v-deep .fr-mb-0 {
  display: none !important;
}
.chart-color-test-modal__mini-wrap ::v-deep p {
  display: none !important;
}
.chart-color-test-modal__actions {
  position: sticky;
  bottom: 0;
  margin-top: 1.5rem;
  padding-top: 1rem;
  padding-bottom: 0.25rem;
  background: linear-gradient(to top, var(--background-default-grey, #f6f6f6) 70%, transparent);
  border-top: 1px solid var(--border-default-grey, #e5e5e5);
  z-index: 2;
}
.chart-color-test-modal__target-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(7.5rem, 1fr));
  gap: 0.5rem;
}
.chart-color-test-modal__target-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.25rem;
  margin: 0;
  padding: 0.5rem 0.35rem;
  border: 2px solid var(--border-default-grey, #ddd);
  border-radius: 0.25rem;
  background: var(--background-default-grey, #fff);
  cursor: pointer;
  min-height: 7.5rem;
  position: relative;
}
.chart-color-test-modal__target-tile:hover {
  border-color: var(--border-action-high-blue-france, #000091);
}
.chart-color-test-modal__target-tile--active {
  border-color: var(--border-action-high-blue-france, #000091);
  box-shadow: 0 0 0 1px var(--border-action-high-blue-france, #000091);
}
.chart-color-test-modal__target-tile-swatch {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.25rem;
  border: 1px solid rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}
.chart-color-test-modal__target-tile-label {
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1.2;
}
.chart-color-test-modal__target-tile-detail {
  font-size: 0.65rem;
  color: var(--text-mention-grey, #666);
  line-height: 1.15;
}
.chart-color-test-modal__target-tile-token {
  font-size: 0.6rem;
  word-break: break-all;
  line-height: 1.1;
  max-width: 100%;
}
.chart-color-test-modal__star {
  position: absolute;
  top: 0.2rem;
  right: 0.35rem;
  color: var(--text-action-high-blue-france, #000091);
  font-weight: 700;
  font-size: 0.9rem;
}
.chart-color-test-modal__palette-heading {
  margin-top: 0;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid var(--border-default-grey, #e5e5e5);
}
.chart-color-test-modal__chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: flex-start;
}
.chart-color-test-modal__chip-sq {
  width: 22px;
  height: 22px;
  padding: 0;
  margin: 0;
  border: 1px solid rgba(0, 0, 0, 0.22);
  border-radius: 3px;
  cursor: pointer;
  flex-shrink: 0;
  box-sizing: border-box;
}
.chart-color-test-modal__chip-sq:hover {
  outline: 2px solid var(--border-action-high-blue-france, #000091);
  outline-offset: 1px;
}
.chart-color-test-modal__chip-sq--current {
  outline: 2px solid var(--border-action-high-blue-france, #000091);
  outline-offset: 0;
  box-shadow: 0 0 0 1px #fff inset;
}
</style>
