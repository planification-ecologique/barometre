import Vue from 'vue'
import { getAllColors } from '@/utils.js'

const STORAGE_KEY = 'sgpe-chart-color-test'

/** Nombre max de séries modifiables dans la modale (couleur1 … couleurN) */
export const CHART_COLOR_TEST_MAX_SERIES = 8

/** Ensemble fictif : aucune surcharge — les graphiques utilisent leurs couleurs de repli (ex. barres, cible). */
export const CHART_COLOR_INITIAL_PRESET_ID = 'couleurs-initiales'

/** 1re / 2e série par défaut : alignés sur `getAllColors()` comme barres empilées et courbes. */
const DEFAULT_PRIMARY = 'green-bourgeon'
const DEFAULT_EXTRAP = 'blue-france-850'
const DEFAULT_TARGET = 'blue-ecume'

/** Ensembles de couleurs cohérents (jetons DSFR / alias résolus par getHexaFromName). */
export const CHART_COLOR_PRESETS = [
  {
    id: 'sgpe-reference',
    label: 'Référence SGPE',
    hint: 'Palette SGPE par défaut : vert bourgeon, bleu France, cible bleu écume, puis teintes d’appoint.',
    target: DEFAULT_TARGET,
    series: [
      DEFAULT_PRIMARY,
      DEFAULT_EXTRAP,
      'blue-france-main-525',
      'green-emeraude-main-632',
      'purple-glycine',
      'orange-terre-battue',
      'yellow-tournesol',
      'red-marianne-main-472'
    ]
  },
  {
    id: 'tons-froids',
    label: 'Tons froids',
    hint: 'Bleus et verts pour une lecture sobre.',
    target: 'blue-france-main-525',
    series: [
      'blue-france-850',
      'blue-ecume',
      'green-archipel',
      'green-menthe',
      'blue-cumulus',
      'purple-glycine',
      'info-main-525',
      'green-emeraude-main-632'
    ]
  },
  {
    id: 'tons-chauds',
    label: 'Tons chauds',
    hint: 'Rouges, oranges et jaunes pour contraster avec le fond.',
    target: 'red-marianne-main-472',
    series: [
      'red-marianne-850',
      'orange-terre-battue-main-645',
      'yellow-tournesol',
      'pink-macaron',
      'brown-caramel',
      'pink-tuile',
      'yellow-moutarde',
      'red-marianne-main-472'
    ]
  },
  {
    id: 'contraste',
    label: 'Lisibilité / contraste',
    hint: 'Teintes saturées alternées pour distinguer plusieurs séries.',
    target: 'brown-caramel',
    series: [
      'blue-france-850',
      'red-marianne-main-472',
      'green-emeraude-main-632',
      'purple-glycine',
      'brown-opera',
      'info-850',
      'warning-850',
      'success-850'
    ]
  },
  {
    id: 'neutres-et-accent',
    label: 'Neutres et accent',
    hint: 'Gammes de gris avec accents bleus.',
    target: 'blue-france-850',
    series: [
      'grey-850',
      'grey-625',
      'grey-425',
      'blue-france-main-525',
      'grey-975',
      'blue-france-200',
      'grey-200',
      'info-main-525'
    ]
  }
]

function normalizeIndexMap (raw) {
  if (!raw || typeof raw !== 'object') return {}
  const out = {}
  for (const k of Object.keys(raw)) {
    if (/^\d+$/.test(String(k)) && raw[k]) out[String(k)] = String(raw[k])
  }
  return out
}

function migrateLegacyToSeries (raw) {
  if (raw.seriesByIndex && typeof raw.seriesByIndex === 'object') {
    return {
      targetToken: raw.targetToken || null,
      seriesByIndex: normalizeIndexMap(raw.seriesByIndex),
      activePresetId: raw.activePresetId || null
    }
  }
  const stacked = normalizeIndexMap(raw.stackedByIndex)
  const line = normalizeIndexMap(raw.lineByIndex)
  const seriesByIndex = {}

  if (raw.primaryToken) seriesByIndex['0'] = raw.primaryToken
  else if (stacked['0']) seriesByIndex['0'] = stacked['0']
  else if (line['0']) seriesByIndex['0'] = line['0']

  if (raw.extrapolationToken) seriesByIndex['1'] = raw.extrapolationToken
  else if (stacked['1']) seriesByIndex['1'] = stacked['1']
  else if (line['1']) seriesByIndex['1'] = line['1']

  for (let i = 0; i < CHART_COLOR_TEST_MAX_SERIES; i++) {
    const k = String(i)
    if (seriesByIndex[k]) continue
    const v = stacked[k] || line[k]
    if (v) seriesByIndex[k] = v
  }

  return {
    targetToken: raw.targetToken || null,
    seriesByIndex: normalizeIndexMap(seriesByIndex),
    activePresetId: null
  }
}

function readStorage () {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return migrateLegacyToSeries({})
    const parsed = JSON.parse(raw) || {}
    return migrateLegacyToSeries(parsed)
  } catch (e) {
    return migrateLegacyToSeries({})
  }
}

function writeStorage (state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      targetToken: state.targetToken || null,
      seriesByIndex: state.seriesByIndex || {},
      activePresetId: state.activePresetId || null
    }))
  } catch (e) {
    /* ignore quota / private mode */
  }
}

const initial = readStorage()

export const chartColorTestState = Vue.observable({
  modalOpen: false,
  targetToken: initial.targetToken || null,
  seriesByIndex: initial.seriesByIndex || {},
  activePresetId: initial.activePresetId || null,
  openModal () {
    this.modalOpen = true
  },
  closeModal () {
    this.modalOpen = false
  },
  setTarget (token) {
    this.activePresetId = null
    this.targetToken = token
    writeStorage(this)
  },
  setSeriesToken (index, token) {
    this.activePresetId = null
    const key = String(index)
    const next = { ...this.seriesByIndex }
    if (token == null || token === '') delete next[key]
    else next[key] = token
    this.seriesByIndex = next
    writeStorage(this)
  },
  applyPreset (presetId) {
    if (presetId === CHART_COLOR_INITIAL_PRESET_ID) {
      this.targetToken = null
      this.seriesByIndex = {}
      this.activePresetId = CHART_COLOR_INITIAL_PRESET_ID
      writeStorage(this)
      return
    }
    const preset = CHART_COLOR_PRESETS.find((p) => p.id === presetId)
    if (!preset) return
    const next = {}
    const palette = getAllColors()
    for (let i = 0; i < CHART_COLOR_TEST_MAX_SERIES; i++) {
      next[String(i)] = String(preset.series[i] || palette[i % palette.length])
    }
    this.seriesByIndex = next
    this.targetToken = preset.target
    this.activePresetId = presetId
    writeStorage(this)
  },
  resetAll () {
    this.targetToken = null
    this.seriesByIndex = {}
    this.activePresetId = CHART_COLOR_INITIAL_PRESET_ID
    writeStorage(this)
  },
  /** Applique le brouillon de la modale (persistance + graphes après rechargement). */
  commitModalDraft (draft) {
    if (!draft || typeof draft !== 'object') return
    this.targetToken = draft.targetToken != null ? draft.targetToken : null
    this.seriesByIndex = draft.seriesByIndex && typeof draft.seriesByIndex === 'object'
      ? { ...draft.seriesByIndex }
      : {}
    this.activePresetId = draft.activePresetId || null
    writeStorage(this)
  }
})

export function getDefaultSeriesPaletteToken (index) {
  const p = getAllColors()
  return p[index % p.length]
}

export function getFallbackPrimaryBarToken () {
  return getDefaultSeriesPaletteToken(0)
}

export function getFallbackExtrapolationBarToken () {
  return getDefaultSeriesPaletteToken(1)
}

/** Couleur de série index (0 = couleur 1, 1 = couleur 2, …) — commune à tous les types de graphiques. */
export function resolveSeriesToken (index, fallbackToken) {
  const key = String(index)
  const v = chartColorTestState.seriesByIndex[key]
  return v || fallbackToken
}

export function resolvePrimaryBarToken (fallback) {
  return resolveSeriesToken(0, fallback)
}

export function resolveExtrapolationToken (fallback) {
  return resolveSeriesToken(1, fallback)
}

export function resolveTargetLineToken (fallback) {
  return chartColorTestState.targetToken || fallback
}

export function resolveStackedSeriesToken (index, fallbackToken) {
  return resolveSeriesToken(index, fallbackToken)
}

export function resolveLineSeriesToken (index, fallbackToken) {
  return resolveSeriesToken(index, fallbackToken)
}

export function getEffectiveSeriesToken (index) {
  return resolveSeriesToken(index, getDefaultSeriesPaletteToken(index))
}

export function getEffectiveStackedSeriesToken (index) {
  return getEffectiveSeriesToken(index)
}

export function getEffectiveLineSeriesToken (index) {
  return getEffectiveSeriesToken(index)
}
