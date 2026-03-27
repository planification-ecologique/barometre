import Vue from 'vue'
import { getAllColors } from '@/utils.js'

const STORAGE_KEY = 'sgpe-chart-color-test'
/** Nombre max de séries modifiables (barres empilées & courbes) dans la modale */
export const CHART_COLOR_TEST_MAX_SERIES = 8

function readStorage () {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) || {}
  } catch (e) {
    return {}
  }
}

function normalizeIndexMap (raw) {
  if (!raw || typeof raw !== 'object') return {}
  const out = {}
  for (const k of Object.keys(raw)) {
    if (/^\d+$/.test(String(k)) && raw[k]) out[String(k)] = String(raw[k])
  }
  return out
}

function writeStorage (state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      primaryToken: state.primaryToken || null,
      extrapolationToken: state.extrapolationToken || null,
      targetToken: state.targetToken || null,
      stackedByIndex: state.stackedByIndex || {},
      lineByIndex: state.lineByIndex || {}
    }))
  } catch (e) {
    /* ignore quota / private mode */
  }
}

const initial = readStorage()

export const chartColorTestState = Vue.observable({
  modalOpen: false,
  primaryToken: initial.primaryToken || null,
  extrapolationToken: initial.extrapolationToken || null,
  targetToken: initial.targetToken || null,
  stackedByIndex: normalizeIndexMap(initial.stackedByIndex),
  lineByIndex: normalizeIndexMap(initial.lineByIndex),
  openModal () {
    this.modalOpen = true
  },
  closeModal () {
    this.modalOpen = false
  },
  setPrimary (token) {
    this.primaryToken = token
    writeStorage(this)
  },
  setExtrapolation (token) {
    this.extrapolationToken = token
    writeStorage(this)
  },
  setTarget (token) {
    this.targetToken = token
    writeStorage(this)
  },
  setStackedSeriesToken (index, token) {
    const key = String(index)
    const next = { ...this.stackedByIndex }
    if (token == null || token === '') delete next[key]
    else next[key] = token
    this.stackedByIndex = next
    writeStorage(this)
  },
  setLineSeriesToken (index, token) {
    const key = String(index)
    const next = { ...this.lineByIndex }
    if (token == null || token === '') delete next[key]
    else next[key] = token
    this.lineByIndex = next
    writeStorage(this)
  },
  resetAll () {
    this.primaryToken = null
    this.extrapolationToken = null
    this.targetToken = null
    this.stackedByIndex = {}
    this.lineByIndex = {}
    writeStorage(this)
  }
})

export function getDefaultSeriesPaletteToken (index) {
  const p = getAllColors()
  return p[index % p.length]
}

export function resolvePrimaryBarToken (fallback) {
  return chartColorTestState.primaryToken || fallback
}

export function resolveExtrapolationToken (fallback) {
  return chartColorTestState.extrapolationToken || fallback
}

export function resolveTargetLineToken (fallback) {
  return chartColorTestState.targetToken || fallback
}

export function resolveStackedSeriesToken (index, fallbackToken) {
  const key = String(index)
  const v = chartColorTestState.stackedByIndex[key]
  return v || fallbackToken
}

export function resolveLineSeriesToken (index, fallbackToken) {
  const key = String(index)
  const v = chartColorTestState.lineByIndex[key]
  return v || fallbackToken
}

export function getEffectiveStackedSeriesToken (index) {
  return resolveStackedSeriesToken(index, getDefaultSeriesPaletteToken(index))
}

export function getEffectiveLineSeriesToken (index) {
  return resolveLineSeriesToken(index, getDefaultSeriesPaletteToken(index))
}
