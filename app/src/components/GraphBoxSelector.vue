<template>
  <div class="fr-container" style="margin-bottom: 2rem;">
    <div class="fr-grid-row">
      <div class="fr-col-12">
        <div
          ref="searchRoot"
          class="indicator-search"
          @focusout="onSearchFocusOut"
        >
          <label class="fr-label" for="graph-search">Sélectionner un indicateur</label>
          <input
            id="graph-search"
            class="fr-input"
            type="search"
            role="combobox"
            autocomplete="off"
            aria-autocomplete="list"
            aria-controls="graph-search-list"
            :aria-expanded="listOpen ? 'true' : 'false'"
            :aria-activedescendant="activeOptionId"
            :disabled="isLoading"
            :placeholder="isLoading ? 'Chargement des indicateurs…' : 'Rechercher par nom ou identifiant'"
            v-model="searchQuery"
            @focus="openList"
            @input="onSearchInput"
            @keydown="onSearchKeydown"
          />
          <ul
            v-show="listOpen"
            id="graph-search-list"
            class="indicator-search__list"
            role="listbox"
          >
            <li
              v-for="(graph, index) in filteredGraphs"
              :id="'graph-option-' + graph.id_indic"
              :key="graph.id_indic"
              role="option"
              class="indicator-search__option"
              :class="{ 'indicator-search__option--active': index === activeIndex }"
              :aria-selected="index === activeIndex ? 'true' : 'false'"
              @mousedown.prevent="selectGraph(graph)"
            >
              {{ graph.label_indic }}
            </li>
            <li v-if="filteredGraphs.length === 0" class="indicator-search__empty" role="presentation">
              Aucun indicateur
            </li>
          </ul>
          <p v-if="listOpen && hiddenMatchCount > 0" class="fr-text--xs fr-text-mention--grey fr-mb-0 fr-mt-1v">
            {{ hiddenMatchCount }} autres résultats. Précisez la recherche.
          </p>
        </div>
      </div>
    </div>

    <div class="fr-grid-row fr-mt-3w" v-if="selectedGraph">
      <div class="fr-col-12">
        <div class="fr-card selector-card">
          <div class="fr-card__body">
            <h3 class="fr-h4">Configuration de l'iframe</h3>
            <div class="fr-grid-row fr-grid-row--gutters">
              <div class="fr-col-md-6">
                <div class="fr-input-group">
                  <label class="fr-label" for="iframe-width">Largeur (px)</label>
                  <input 
                    id="iframe-width" 
                    class="fr-input" 
                    type="number" 
                    v-model.number="iframeWidth"
                    min="200"
                    max="1200"
                  />
                </div>
              </div>
              <div class="fr-col-md-6">
                <div class="fr-input-group">
                  <label class="fr-label" for="iframe-height">Hauteur (px)</label>
                  <input 
                    id="iframe-height" 
                    class="fr-input" 
                    type="number" 
                    v-model.number="iframeHeight"
                    min="300"
                    max="1000"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="fr-grid-row fr-mt-3w" v-if="selectedGraph">
      <div class="fr-col-12">
        <div class="fr-card selector-card">
          <div class="fr-card__body">
            <h3 class="fr-h4">Code d'intégration</h3>
            <div class="fr-input-group">
              <label class="fr-label" for="iframe-code">Code iframe</label>
              <textarea 
                id="iframe-code" 
                class="fr-input" 
                rows="4" 
                readonly
                v-model="iframeCode"
              ></textarea>
            </div>
            <button 
              class="fr-btn fr-btn--secondary fr-mt-2w"
              @click="copyIframeCode"
            >
              Copier le code
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="fr-grid-row fr-mt-3w" v-if="selectedGraph">
      <div class="fr-col-12">
        <div class="fr-card selector-card">
          <div class="fr-card__body">
            <h3 class="fr-h4">Aperçu</h3>
            <div class="iframe-preview">
              <iframe
                :src="iframeSrc"
                :width="iframeWidth"
                :height="iframeHeight"
                frameborder="0"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="fr-grid-row fr-mt-3w" v-if="selectedGraph">
      <div class="fr-col-12">
        <div class="chart-selector-tools">
          <div class="fr-toggle">
            <input
              id="capture-mode"
              type="checkbox"
              class="fr-toggle__input"
              v-model="captureMode"
            />
            <label
              class="fr-toggle__label"
              for="capture-mode"
              data-fr-checked-label="Activé"
              data-fr-unchecked-label="Désactivé"
            >
              Préparer l'export (lecture)
            </label>
          </div>
          <button
            type="button"
            class="fr-btn fr-btn--secondary"
            :disabled="imageBusy"
            @click="downloadImage"
          >
            {{ imageBusy ? "Préparation…" : "Télécharger en image" }}
          </button>
        </div>
        <p v-if="imageError" class="fr-error-text">{{ imageError }}</p>
        <graph-box
          ref="graphPreview"
          :dataObj="selectedGraph"
          :idAccordion="'graph-' + selectedGraph.id_indic"
          :hideCaptureChrome="captureMode"
        ></graph-box>
      </div>
    </div>
  </div>
</template>

<script>
import { toPng } from 'html-to-image'
import GraphBox from './GraphBox.vue'
import { generateChartIframe } from '@/utils/chartIframe'
import { filterIndicatorOptions } from '@/utils/indicatorSearch'
import { getIndicators } from '@/services/csvDataService'

export default {
  name: 'GraphBoxSelector',
  components: {
    GraphBox
  },
  data() {
    return {
      selectedGraphId: '',
      availableGraphs: [],
      selectedGraph: null,
      isLoading: false,
      iframeWidth: 300,
      iframeHeight: 600,
      searchQuery: '',
      listOpen: false,
      activeIndex: 0,
      captureMode: false,
      imageBusy: false,
      imageError: ''
    }
  },
  computed: {
    searchResults() {
      return filterIndicatorOptions(this.availableGraphs, this.searchQuery)
    },
    filteredGraphs() {
      return this.searchResults.matches
    },
    hiddenMatchCount() {
      return this.searchResults.hiddenCount
    },
    activeOptionId() {
      const graph = this.filteredGraphs[this.activeIndex]
      return graph ? 'graph-option-' + graph.id_indic : undefined
    },
    iframeCode() {
      if (!this.selectedGraph) return ''
      
      const chartData = {
        id: this.selectedGraph.id_indic
      }
      
      return generateChartIframe(chartData, {
        width: this.iframeWidth,
        height: this.iframeHeight
      })
    },
    iframeSrc() {
      if (!this.selectedGraph) return ''
      return `/chart-iframe?id=${this.selectedGraph.id_indic}`
    }
  },
  methods: {
    async loadAvailableGraphs() {
      this.isLoading = true
      try {
        const response = await getIndicators({
          time_period: {
            date_start: "2015-01-01",
            date_end: "2031-01-01"
          }
        }, 'staging')
        
        this.availableGraphs = response.results
      } catch (error) {
        console.error('Failed to load graphs:', error)
      } finally {
        this.isLoading = false
      }
    },
    openList() {
      this.listOpen = true
      this.activeIndex = 0
    },
    onSearchInput() {
      this.openList()
      if (!String(this.searchQuery || '').trim()) {
        this.selectedGraph = null
        this.selectedGraphId = ''
      }
    },
    onSearchFocusOut(event) {
      const root = this.$refs.searchRoot
      if (root && event.relatedTarget && root.contains(event.relatedTarget)) return
      this.listOpen = false
      if (this.selectedGraph) this.searchQuery = this.selectedGraph.label_indic || ''
    },
    onSearchKeydown(event) {
      const lastIndex = this.filteredGraphs.length - 1
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        if (!this.listOpen) {
          this.listOpen = true
          this.activeIndex = 0
          return
        }
        if (lastIndex < 0) return
        this.activeIndex = Math.min(this.activeIndex + 1, lastIndex)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        this.activeIndex = Math.max(this.activeIndex - 1, 0)
      } else if (event.key === 'Enter') {
        const graph = this.filteredGraphs[this.activeIndex]
        if (this.listOpen && graph) {
          event.preventDefault()
          this.selectGraph(graph)
        }
      } else if (event.key === 'Escape') {
        this.listOpen = false
      }
    },
    selectGraph(graph) {
      this.selectedGraphId = graph.id_indic
      this.selectedGraph = graph
      this.searchQuery = graph.label_indic || ''
      this.listOpen = false
      this.imageError = ''
    },
    imageFilename() {
      const label = String(this.selectedGraph?.label_indic || 'indicateur')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/gi, '')
        .replace(/\s+/g, '_')
        .trim()
      return label || 'indicateur'
    },
    async downloadImage() {
      const node = this.$refs.graphPreview && this.$refs.graphPreview.$el
      if (!node) return
      this.imageBusy = true
      this.imageError = ''
      try {
        const width = Math.ceil(node.getBoundingClientRect().width)
        const height = Math.ceil(Math.max(node.scrollHeight, node.getBoundingClientRect().height))
        const dataUrl = await toPng(node, {
          backgroundColor: '#ffffff',
          pixelRatio: 2,
          cacheBust: true,
          width,
          height,
          style: {
            margin: '0',
            width: width + 'px',
            height: height + 'px',
            maxHeight: 'none',
            overflow: 'visible',
            transform: 'none',
            filter: 'none',
            boxShadow: '0 1px 3px rgba(0, 0, 18, 0.16)'
          }
        })
        const link = document.createElement('a')
        link.href = dataUrl
        link.download = this.imageFilename() + '.png'
        link.click()
      } catch (error) {
        console.error('Failed to export chart image:', error)
        this.imageError = "Le téléchargement de l'image a échoué."
      } finally {
        this.imageBusy = false
      }
    },
    copyIframeCode() {
      const textarea = document.getElementById('iframe-code')
      textarea.select()
      document.execCommand('copy')
    }
  },
  mounted() {
    this.loadAvailableGraphs()
  }
}
</script>

<style scoped>

.selector-card {
  margin-top: 2rem;
  margin-bottom: 1.5rem;
}

.iframe-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f6f6f6;
  border-radius: 4px;
}

.indicator-search {
  position: relative;
}

.indicator-search__list {
  position: absolute;
  z-index: 20;
  left: 0;
  right: 0;
  top: calc(100% - 0.25rem);
  max-height: 18rem;
  margin: 0;
  padding: 0.25rem 0;
  overflow: auto;
  list-style: none;
  background: #fff;
  border: 1px solid #ddd;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}

.indicator-search__option,
.indicator-search__empty {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
}

.indicator-search__option--active,
.indicator-search__option:hover {
  background: #f6f6f6;
}

.indicator-search__empty {
  cursor: default;
  color: #666;
}

.chart-selector-tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}
</style> 