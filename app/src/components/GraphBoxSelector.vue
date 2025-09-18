<template>
  <div class="fr-container" style="margin-bottom: 2rem;">
    <div class="fr-grid-row">
      <div class="fr-col-12">
        <div class="fr-select-group">
          <label class="fr-label" for="graph-select">Sélectionner un indicateur</label>
          <select 
            class="fr-select" 
            id="graph-select" 
            v-model="selectedGraphId"
            @change="handleGraphSelection"
          >
            <option value="">Choisir un indicateur</option>
            <option 
              v-for="graph in sortedGraphs" 
              :key="graph.id_indic" 
              :value="graph.id_indic"
            >
              {{ graph.label_indic }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="fr-grid-row fr-mt-3w" v-if="selectedGraph">
      <div class="fr-col-12">
        <div class="fr-card">
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
        <div class="fr-card">
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
        <div class="fr-card">
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
        <graph-box 
          :dataObj="selectedGraph" 
          :idAccordion="'graph-' + selectedGraph.id_indic"
        ></graph-box>
      </div>
    </div>
  </div>
</template>

<script>
import GraphBox from './GraphBox.vue'
import { generateChartIframe } from '@/utils/chartIframe'
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
      iframeHeight: 600
    }
  },
  computed: {
    sortedGraphs() {
      return [...this.availableGraphs].sort((a, b) => 
        a.label_indic.localeCompare(b.label_indic, 'fr')
      )
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
    handleGraphSelection() {
      if (!this.selectedGraphId) {
        this.selectedGraph = null
        return
      }
      
      this.selectedGraph = this.availableGraphs.find(
        graph => graph.id_indic === this.selectedGraphId
      )
      
      if (!this.selectedGraph) {
        console.error('Selected graph not found:', this.selectedGraphId)
      }
    },
    copyIframeCode() {
      const textarea = document.getElementById('iframe-code')
      textarea.select()
      document.execCommand('copy')
    }
  },
  watch: {
    selectedGraphId(newVal) {
      this.handleGraphSelection()
    }
  },
  mounted() {
    this.loadAvailableGraphs()
  }
}
</script>

<style scoped>

.fr-card {
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
</style> 