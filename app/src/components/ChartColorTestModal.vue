<template>
  <div
    v-if="chartColorModalOpen"
    id="fr-chart-color-test-modal"
    class="chart-color-test-modal__backdrop"
    role="dialog"
    aria-modal="true"
    aria-labelledby="fr-chart-color-test-modal-title"
    tabindex="-1"
    @click.self="close"
    @keydown.esc.prevent="close"
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
                title="Fermer"
                @click="close"
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
                — cliquez d’abord <strong>l’élément</strong> à modifier, puis un <strong>carré de couleur</strong>.
                La page se recharge après chaque choix.
              </p>

              <!-- Cibles : tout cliquable, pas de liste déroulante -->
              <section class="chart-color-test-modal__targets fr-mb-3w" aria-label="Éléments à recolorer">
                <h2 class="fr-h5 fr-mb-1w">Éléments du graphique</h2>
                <p class="fr-text--xs fr-text-mention--grey fr-mb-2w">
                  Carte sélectionnée : bordure bleue. Astérisque * = couleur personnalisée (barres / courbes).
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
                  <button type="button" class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm" @click="clearActiveRole">
                    Défaut pour cette carte
                  </button>
                  <button type="button" class="fr-btn fr-btn--secondary fr-btn--sm" @click="resetAll">
                    Tout réinitialiser
                  </button>
                </div>
              </section>

              <!-- Palette : familles visibles d’un coup, petits carrés uniquement -->
              <section class="chart-color-test-modal__palette-section" aria-label="Palette complète">
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
                      @click="select(token)"
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  DSFR_PALETTE_MAP,
  DSFR_PALETTE_CATEGORY_ORDER,
  DSFR_PALETTE_CATEGORY_LABELS,
  DSFR_PALETTE_CATEGORIES
} from '@/config/dsfrChartPalette.js'
import {
  chartColorTestState,
  CHART_COLOR_TEST_MAX_SERIES,
  getDefaultSeriesPaletteToken,
  getEffectiveStackedSeriesToken,
  getEffectiveLineSeriesToken,
  resolvePrimaryBarToken,
  resolveExtrapolationToken,
  resolveTargetLineToken
} from '@/services/chartColorTestOverrides.js'
import { getHexaFromName } from '@/utils.js'

const DEFAULT_PRIMARY = 'blue-france-850'
const DEFAULT_EXTRAP = 'green-emeraude'
const DEFAULT_TARGET = 'blue-ecume'

function parseActiveRole (role) {
  if (!role) return { kind: 'primary' }
  const s = String(role)
  if (s.startsWith('stacked-')) {
    const index = parseInt(s.slice(8), 10)
    return { kind: 'stacked', index: Number.isNaN(index) ? 0 : index }
  }
  if (s.startsWith('line-')) {
    const index = parseInt(s.slice(5), 10)
    return { kind: 'line', index: Number.isNaN(index) ? 0 : index }
  }
  return { kind: s }
}

export default {
  name: 'ChartColorTestModal',
  data () {
    return {
      filter: '',
      activeRole: 'primary',
      paletteMap: DSFR_PALETTE_MAP,
      categoryOrder: DSFR_PALETTE_CATEGORY_ORDER,
      categoryLabels: DSFR_PALETTE_CATEGORY_LABELS,
      DSFR_PALETTE_CATEGORIES
    }
  },
  computed: {
    chartColorModalOpen () {
      return chartColorTestState.modalOpen
    },
    seriesIdx () {
      return Array.from({ length: CHART_COLOR_TEST_MAX_SERIES }, (_, i) => i)
    },
    targetGroups () {
      chartColorTestState.primaryToken
      chartColorTestState.extrapolationToken
      chartColorTestState.targetToken
      chartColorTestState.stackedByIndex
      chartColorTestState.lineByIndex

      const tokPrimary = resolvePrimaryBarToken(DEFAULT_PRIMARY)
      const tokExtrap = resolveExtrapolationToken(DEFAULT_EXTRAP)
      const tokTarget = resolveTargetLineToken(DEFAULT_TARGET)

      return [
        {
          id: 'simple',
          title: 'Histogramme national (barres simples)',
          hint: 'Historique, extrapolation, cible — même logique que les indicateurs nationaux.',
          targets: [
            {
              role: 'primary',
              label: 'Historique',
              detail: 'Tendance + vline',
              token: tokPrimary,
              hex: getHexaFromName(tokPrimary),
              customized: chartColorTestState.primaryToken != null
            },
            {
              role: 'extrapolation',
              label: 'Extrapolation',
              detail: '',
              token: tokExtrap,
              hex: getHexaFromName(tokExtrap),
              customized: chartColorTestState.extrapolationToken != null
            },
            {
              role: 'target',
              label: 'Cible',
              detail: 'Trajectoire',
              token: tokTarget,
              hex: getHexaFromName(tokTarget),
              customized: chartColorTestState.targetToken != null
            }
          ]
        },
        {
          id: 'stacked',
          title: 'Barres empilées',
          hint: 'Séries 1 à 8 = ordre des sous-groupes. Sinon palette DSFR en rotation.',
          targets: this.seriesIdx.map((index) => {
            const token = getEffectiveStackedSeriesToken(index)
            return {
              role: `stacked-${index}`,
              label: `Série ${index + 1}`,
              detail: `déf. ${getDefaultSeriesPaletteToken(index)}`,
              token,
              hex: getHexaFromName(token),
              customized: !!chartColorTestState.stackedByIndex[String(index)]
            }
          })
        },
        {
          id: 'lines',
          title: 'Courbes indépendantes',
          hint: 'Courbes 1 à 8 — même palette par défaut que les barres empilées.',
          targets: this.seriesIdx.map((index) => {
            const token = getEffectiveLineSeriesToken(index)
            return {
              role: `line-${index}`,
              label: `Courbe ${index + 1}`,
              detail: `déf. ${getDefaultSeriesPaletteToken(index)}`,
              token,
              hex: getHexaFromName(token),
              customized: !!chartColorTestState.lineByIndex[String(index)]
            }
          })
        }
      ]
    },
    activeRoleLabel () {
      for (const g of this.targetGroups) {
        const t = g.targets.find((x) => x.role === this.activeRole)
        if (t) return `${g.title.split('(')[0].trim()} — ${t.label}`
      }
      return this.activeRole
    },
    activeRoleDescription () {
      const p = parseActiveRole(this.activeRole)
      let token
      if (p.kind === 'stacked') token = getEffectiveStackedSeriesToken(p.index)
      else if (p.kind === 'line') token = getEffectiveLineSeriesToken(p.index)
      else if (p.kind === 'primary') token = resolvePrimaryBarToken(DEFAULT_PRIMARY)
      else if (p.kind === 'extrapolation') token = resolveExtrapolationToken(DEFAULT_EXTRAP)
      else if (p.kind === 'target') token = resolveTargetLineToken(DEFAULT_TARGET)
      else token = DEFAULT_PRIMARY
      return `${token} (${getHexaFromName(token)})`
    },
    visibleCategories () {
      this.filter
      return this.categoryOrder.filter((cat) => this.filteredTokensForCategory(cat).length > 0)
    }
  },
  watch: {
    chartColorModalOpen (open) {
      if (open) {
        this.$nextTick(() => {
          const root = document.getElementById('fr-chart-color-test-modal')
          if (root && typeof root.focus === 'function') root.focus()
        })
      }
    }
  },
  methods: {
    getDefaultSeriesPaletteToken,
    setActiveRole (role) {
      this.activeRole = role
    },
    reloadAfterColorChange () {
      window.location.reload()
    },
    close () {
      chartColorTestState.closeModal()
    },
    resetAll () {
      chartColorTestState.resetAll()
      this.reloadAfterColorChange()
    },
    clearActiveRole () {
      const p = parseActiveRole(this.activeRole)
      if (p.kind === 'stacked') chartColorTestState.setStackedSeriesToken(p.index, null)
      else if (p.kind === 'line') chartColorTestState.setLineSeriesToken(p.index, null)
      else if (p.kind === 'primary') chartColorTestState.setPrimary(null)
      else if (p.kind === 'extrapolation') chartColorTestState.setExtrapolation(null)
      else if (p.kind === 'target') chartColorTestState.setTarget(null)
      this.reloadAfterColorChange()
    },
    select (token) {
      const p = parseActiveRole(this.activeRole)
      if (p.kind === 'stacked') chartColorTestState.setStackedSeriesToken(p.index, token)
      else if (p.kind === 'line') chartColorTestState.setLineSeriesToken(p.index, token)
      else if (p.kind === 'primary') chartColorTestState.setPrimary(token)
      else if (p.kind === 'extrapolation') chartColorTestState.setExtrapolation(token)
      else if (p.kind === 'target') chartColorTestState.setTarget(token)
      this.reloadAfterColorChange()
    },
    isSelected (token) {
      const p = parseActiveRole(this.activeRole)
      if (p.kind === 'stacked') return getEffectiveStackedSeriesToken(p.index) === token
      if (p.kind === 'line') return getEffectiveLineSeriesToken(p.index) === token
      if (p.kind === 'primary') return resolvePrimaryBarToken(DEFAULT_PRIMARY) === token
      if (p.kind === 'extrapolation') return resolveExtrapolationToken(DEFAULT_EXTRAP) === token
      if (p.kind === 'target') return resolveTargetLineToken(DEFAULT_TARGET) === token
      return false
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
