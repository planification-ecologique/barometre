<template>
  <nav role="navigation" class="fr-sidemenu fr-sidemenu__padding"
    aria-label="Navigation des volets">
    <div class="fr-sidemenu__inner">
      <button class="fr-sidemenu__btn" aria-controls="fr-sidemenu-wrapper" aria-expanded="false">
        Navigation
      </button>
      <div class="fr-collapse" id="fr-sidemenu-wrapper">
        <ul class="fr-sidemenu__list">
          <!-- Synthèse sector: À propos, Indicateurs d'impact (with sub-menus) and Chantiers (with sub-menus) -->
          <template v-if="sector === 'Synthèse'">
            <!-- À propos -->
            <li class="fr-sidemenu__item">
              <a class="fr-sidemenu__link" 
                title="À propos"
                @click="set_about"
                target="_self"
                :aria-current="currentView === 'about'"
                tabindex="0"
                v-on:keyup.enter="set_about"
              >
                À propos
              </a>
            </li>
            
            <!-- Indicateurs d'impact with sub-menu -->
            <li class="fr-sidemenu__item">
              <button 
                class="fr-sidemenu__btn"
                :aria-expanded="expandedIndicateurs"
                :aria-current="currentView === 'general-engagements'"
                @click="toggleIndicateurs"
              >
                Indicateurs d'impact
              </button>
              <div class="fr-collapse" :class="{ 'fr-collapse--expanded': expandedIndicateurs }">
                <ul class="fr-sidemenu__list">
                  <li class="fr-sidemenu__item">
                    <a class="fr-sidemenu__link" 
                      title="Tableau de synthèse"
                      @click="set_engagements_table"
                      target="_self"
                      :aria-current="currentView === 'engagements-table'"
                      tabindex="0"
                      v-on:keyup.enter="set_engagements_table"
                    >
                      Tableau de synthèse
                    </a>
                  </li>
                  <li class="fr-sidemenu__item" v-for="axe in taxonomyAxes" :key="axe">
                    <a class="fr-sidemenu__link" 
                      :title="axe"
                      @click="set_general_engagements(axe)"
                      target="_self"
                      :aria-current="currentView === 'general-engagements' && currentAxe === axe"
                      tabindex="0"
                      v-on:keyup.enter="set_general_engagements(axe)"
                    >
                      {{ axe }}
                    </a>
                  </li>
                </ul>
              </div>
            </li>
            
            <!-- Chantiers with sub-menu -->
            <li class="fr-sidemenu__item">
              <button 
                class="fr-sidemenu__btn"
                :aria-expanded="expandedChantiers"
                :aria-current="currentView === 'general-chantiers'"
                @click="toggleChantiers"
              >
                Chantiers Sectoriels
              </button>
              <div class="fr-collapse" :class="{ 'fr-collapse--expanded': expandedChantiers }">
                <ul class="fr-sidemenu__list">
                  <li class="fr-sidemenu__item">
                    <a class="fr-sidemenu__link" 
                      title="Tableau de synthèse"
                      @click="set_chantiers_table"
                      target="_self"
                      :aria-current="currentView === 'chantiers-table'"
                      tabindex="0"
                      v-on:keyup.enter="set_chantiers_table"
                    >
                      Tableau de synthèse
                    </a>
                  </li>
                  <li class="fr-sidemenu__item" v-for="sectorName in chantierSectors" :key="sectorName">
                    <a class="fr-sidemenu__link" 
                      :title="sectorName"
                      @click="set_general_chantiers(sectorName)"
                      target="_self"
                      :aria-current="currentView === 'general-chantiers' && currentSectorFilter === sectorName"
                      tabindex="0"
                      v-on:keyup.enter="set_general_chantiers(sectorName)"
                    >
                      {{ sectorName }}
                    </a>
                  </li>
                </ul>
              </div>
            </li>
          </template>
          
          <!-- Sectoriel: Indicateurs d'impact and Chantiers menu -->
          <template v-else>
            <li class="fr-sidemenu__item">
                  <a class="fr-sidemenu__link" 
                title="Indicateurs d'impact"
                @click="set_sectorial_engagements"
                    target="_self"
                :aria-current="currentView === 'sectorial-engagements'"
                    tabindex="0"
                v-on:keyup.enter="set_sectorial_engagements"
                  >
                Indicateurs d'impact
                  </a>
                </li>
            <!-- Chantiers Sectoriels: title + always-open indented sub-list -->
            <li class="fr-sidemenu__item">
              <span class="fr-sidemenu__link sidemenu-section-title" aria-hidden="true">Chantiers Sectoriels</span>
              <div class="fr-collapse fr-collapse--expanded">
                <ul class="fr-sidemenu__list">
                  <li class="fr-sidemenu__item" v-for="(chantier, index) in chantiers" :key="index">
                    <a class="fr-sidemenu__link" 
                      :title="chantier.name"
                      @click="set_chantier(chantier)"
                      target="_self"
                      :aria-current="currentView === 'chantier' && currentChantierId === chantier.id"
                      tabindex="0"
                      v-on:keyup.enter="set_chantier(chantier)"
                    >
                      {{ chantier.name }}
                    </a>
                  </li>
                </ul>
              </div>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>
<script>
import { getNavigationStructure } from "@/services/csvDataService.js";

export default {
  name: "SideNavigation",
  data() {
    return {
      chantiers: [],
      currentView: null,
      currentChantierId: null,
      currentAxe: null,
      currentSectorFilter: null,
      taxonomyAxes: [],
      chantierSectors: [],
      expandedIndicateurs: false,
      expandedChantiers: false,
      navigationData: null,  // Store the full navigation structure
      isLoading: true,
    };
  },
  props: {
    initParams: {
      type: Object,
    },
    useStaging: {
      type: Boolean,
      default: false
    },
    sector: {
      type: String,
      default: 'Synthèse'
    }
  },
  methods: {
    async loadChantiers() {
      // Load navigation structure from Grist data
      try {
        this.isLoading = true;
        const environment = this.useStaging ? 'staging' : 'production';
        const response = await getNavigationStructure(environment);
        
        if (response.status === 'success') {
          this.navigationData = response.data;
          
          // Get data for current sector
          const sectorData = response.data.sectors.find(s => s.name === this.sector);
          
          if (sectorData) {
            // Build chantiers list from the navigation data
            this.chantiers = Object.entries(sectorData.chantiers)
              .map(([name, chantierData]) => ({
                id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                name: name,
                sortedLeviers: chantierData.sortedLeviers || [],
                // Collect all grist IDs from all leviers
                grist_ids: Object.values(chantierData.leviers)
                  .flat()
                  .map(item => item.gristId)
                  .filter(id => id)
              }))
              .sort((a, b) => a.name.localeCompare(b.name));
            
            // For Synthèse sector, load taxonomy axes and chantier sectors from navigation data
            if (this.sector === 'Synthèse') {
              this.loadTaxonomyAxes();
              this.loadChantierSectors();
            }
          } else {
            this.chantiers = [];
          }
        }
        
        this.isLoading = false;
        
        // Initialize with view from initParams, or default view based on sector
        if (!this.initParams || !this.initParams.view) {
          // No view specified - use default for sector
          if (this.sector === 'Synthèse') {
            this.set_about();
          } else {
            this.set_sectorial_engagements();
          }
        } else if (this.initParams.view === 'about') {
          // Only valid for Synthèse sector
          if (this.sector === 'Synthèse') {
            this.set_about();
          } else {
            this.set_sectorial_engagements();
          }
        } else if (this.initParams.view === 'engagements-table') {
          // Only valid for Synthèse sector
          if (this.sector === 'Synthèse') {
            this.set_engagements_table();
            this.expandedIndicateurs = true;
          } else {
            this.set_sectorial_engagements();
          }
        } else if (this.initParams.view === 'chantiers-table') {
          // Only valid for Synthèse sector
          if (this.sector === 'Synthèse') {
            this.set_chantiers_table();
            this.expandedChantiers = true;
          } else {
            this.set_sectorial_engagements();
          }
        } else if (this.initParams.view === 'chantier' && this.initParams.chantier_id) {
          // Try to find the chantier in the current sector
          const chantier = this.chantiers.find(c => c.id === this.initParams.chantier_id);
          if (chantier) {
            // Chantier exists in this sector - use it
            this.set_chantier(chantier);
          } else {
            // Chantier doesn't exist in this sector - use default view
            if (this.sector === 'Synthèse') {
              this.set_about();
            } else {
              this.set_sectorial_engagements();
            }
          }
        } else if (this.initParams.view === 'general-engagements') {
          // Only valid for Synthèse sector
          if (this.sector === 'Synthèse') {
            const axe = this.initParams.axe || null;
            this.set_general_engagements(axe);
            if (axe) this.expandedIndicateurs = true;
          } else {
            // Invalid view for this sector - use default
            this.set_sectorial_engagements();
          }
        } else if (this.initParams.view === 'general-chantiers') {
          // Only valid for Synthèse sector
          if (this.sector === 'Synthèse') {
            const sectorFilter = this.initParams.sectorFilter || null;
            this.set_general_chantiers(sectorFilter);
            if (sectorFilter) this.expandedChantiers = true;
          } else {
            // Invalid view for this sector - use default
            this.set_sectorial_engagements();
          }
        } else if (this.initParams.view === 'sectorial-engagements') {
          // Valid for all sectors except Synthèse
          if (this.sector === 'Synthèse') {
            // Invalid view for Synthèse - use default
            this.set_about();
          } else {
            this.set_sectorial_engagements();
          }
        } else {
          // Unknown view - use default
          if (this.sector === 'Synthèse') {
            this.set_about();
          } else {
            this.set_sectorial_engagements();
          }
        }
      } catch (error) {
        console.error("Error loading chantiers:", error);
        this.chantiers = [];
      }
    },
    loadTaxonomyAxes() {
      try {
        if (!this.navigationData) return;
        
        // Get the Synthèse sector data
        const syntheseSector = this.navigationData.sectors.find(s => s.name === 'Synthèse');
        if (!syntheseSector || !syntheseSector.indicateursImpact) return;
        
        // Get unique taxonomy axes from indicateursImpact (which are grouped by axe)
        this.taxonomyAxes = Object.keys(syntheseSector.indicateursImpact)
          .filter(axe => axe && axe !== 'Autre')
          .sort();
      } catch (error) {
        console.error("Error loading taxonomy axes:", error);
        this.taxonomyAxes = [];
      }
    },
    loadChantierSectors() {
      try {
        if (!this.navigationData) return;
        
        // Get sectors that have chantiers (excluding Synthèse), sorted alphabetically
        const sectorsWithChantiers = this.navigationData.sectors
          .filter(s => s.name !== 'Synthèse' && Object.keys(s.chantiers).length > 0)
          .map(s => s.name)
          .sort((a, b) => a.localeCompare(b, 'fr'));
        
        this.chantierSectors = sectorsWithChantiers;
      } catch (error) {
        console.error("Error loading chantier sectors:", error);
        this.chantierSectors = [];
      }
    },
    toggleIndicateurs() {
      this.expandedIndicateurs = !this.expandedIndicateurs;
    },
    toggleChantiers() {
      this.expandedChantiers = !this.expandedChantiers;
    },
    set_about() {
      this.currentView = 'about';
      this.currentChantierId = null;
      this.currentAxe = null;
      this.currentSectorFilter = null;
      
      const params = {
        view: 'about',
        label: 'À propos',
        sector: 'Synthèse',
      };
      this.$emit("params", params);
    },
    set_engagements_table() {
      this.currentView = 'engagements-table';
      this.currentChantierId = null;
      this.currentAxe = null;
      this.currentSectorFilter = null;
      
      try {
        // Get all impact indicator grist IDs for Synthèse sector from navigation data
        const engagementIds = [];
        if (this.navigationData) {
          const syntheseSector = this.navigationData.sectors.find(s => s.name === 'Synthèse');
          if (syntheseSector && syntheseSector.indicateursImpact) {
            Object.values(syntheseSector.indicateursImpact).forEach(indicators => {
              indicators.forEach(item => {
                if (item.gristId) {
                  engagementIds.push(item.gristId);
                }
              });
            });
          }
        }
      
        const params = {
          view: 'engagements-table',
          label: 'Tableau de synthèse - Indicateurs d\'impact',
          sector: 'Synthèse',
          query: {
            filter_by: [
              { field: "grist_ids", values: engagementIds },
            ],
            time_period: {
              date_start: "2015-01-01",
              date_end: "2031-01-01",
            },
          },
        };
        this.$emit("params", params);
      } catch (error) {
        console.error("Error setting engagements table view:", error);
      }
    },
    set_chantiers_table() {
      this.currentView = 'chantiers-table';
      this.currentChantierId = null;
      this.currentAxe = null;
      this.currentSectorFilter = null;
      
      try {
        // Get only "Indicateur de chantier" grist IDs (excluding Synthèse sector)
        const chantierIds = [];
        if (this.navigationData) {
          this.navigationData.sectors
            .filter(s => s.name !== 'Synthèse')
            .forEach(sector => {
              Object.values(sector.chantiers).forEach(chantier => {
                // Only get "Indicateur de chantier" leviers
                const chantierLevelIndicators = chantier.leviers['Indicateur de chantier'] || [];
                chantierLevelIndicators.forEach(item => {
                  if (item.gristId) {
                    chantierIds.push(item.gristId);
                  }
                });
              });
            });
        }
      
        const params = {
          view: 'chantiers-table',
          label: 'Tableau de synthèse - Chantiers',
          sector: 'Synthèse',
          query: {
            filter_by: [
              { field: "grist_ids", values: chantierIds },
            ],
            time_period: {
              date_start: "2015-01-01",
              date_end: "2031-01-01",
            },
          },
        };
        this.$emit("params", params);
      } catch (error) {
        console.error("Error setting chantiers table view:", error);
      }
    },
    set_general_engagements(axe = null) {
      this.currentView = 'general-engagements';
      this.currentChantierId = null;
      this.currentAxe = axe;
      this.currentSectorFilter = null;
      
      try {
        // Get impact indicator grist IDs for Synthèse sector, optionally filtered by axe
        const engagementIds = [];
        if (this.navigationData) {
          const syntheseSector = this.navigationData.sectors.find(s => s.name === 'Synthèse');
          if (syntheseSector && syntheseSector.indicateursImpact) {
            if (axe) {
              // Filter by specific axe
              const axeIndicators = syntheseSector.indicateursImpact[axe] || [];
              axeIndicators.forEach(item => {
                if (item.gristId) engagementIds.push(item.gristId);
              });
            } else {
              // Get all impact indicators
              Object.values(syntheseSector.indicateursImpact).forEach(indicators => {
                indicators.forEach(item => {
                  if (item.gristId) engagementIds.push(item.gristId);
                });
              });
            }
          }
        }
      
        const params = {
          view: 'general-engagements',
          label: axe ? axe : 'Indicateurs d\'impact',
          sector: 'Synthèse',
          axe: axe,
          query: {
            filter_by: [
              { field: "grist_ids", values: engagementIds },
            ],
            time_period: {
              date_start: "2015-01-01",
              date_end: "2031-01-01",
            },
          },
        };
        this.$emit("params", params);
      } catch (error) {
        console.error("Error setting general engagements view:", error);
      }
    },
    set_general_chantiers(sectorFilter = null) {
      this.currentView = 'general-chantiers';
      this.currentChantierId = null;
      this.currentAxe = null;
      this.currentSectorFilter = sectorFilter;
      
      try {
        // Get only "Indicateur de chantier" grist IDs, optionally filtered by sector
        const chantierIds = [];
        if (this.navigationData) {
          const sectorsToInclude = sectorFilter 
            ? this.navigationData.sectors.filter(s => s.name === sectorFilter)
            : this.navigationData.sectors.filter(s => s.name !== 'Synthèse');
          
          sectorsToInclude.forEach(sector => {
            Object.values(sector.chantiers).forEach(chantier => {
              // Only get "Indicateur de chantier" leviers
              const chantierLevelIndicators = chantier.leviers['Indicateur de chantier'] || [];
              chantierLevelIndicators.forEach(item => {
                if (item.gristId) chantierIds.push(item.gristId);
              });
            });
          });
        }
      
        const params = {
          view: 'general-chantiers',
          label: sectorFilter ? sectorFilter : 'Chantiers',
          sector: 'Synthèse',
          sectorFilter: sectorFilter,
          query: {
            filter_by: [
              { field: "grist_ids", values: chantierIds },
            ],
            time_period: {
              date_start: "2015-01-01",
              date_end: "2031-01-01",
            },
          },
        };
        this.$emit("params", params);
      } catch (error) {
        console.error("Error setting general chantiers view:", error);
      }
    },
    set_sectorial_engagements() {
      this.currentView = 'sectorial-engagements';
      this.currentChantierId = null;
      
      try {
        // Get all impact indicator grist IDs for current sector
        const engagementIds = [];
        if (this.navigationData) {
          const sectorData = this.navigationData.sectors.find(s => s.name === this.sector);
          if (sectorData && sectorData.indicateursImpact) {
            Object.values(sectorData.indicateursImpact).forEach(indicators => {
              indicators.forEach(item => {
                if (item.gristId) engagementIds.push(item.gristId);
              });
            });
          }
        }
      
        const params = {
          view: 'sectorial-engagements',
          label: 'Indicateurs d\'impact',
          sector: this.sector,
          query: {
            filter_by: [
              { field: "grist_ids", values: engagementIds },
            ],
            time_period: {
              date_start: "2015-01-01",
              date_end: "2031-01-01",
            },
          },
        };
        this.$emit("params", params);
      } catch (error) {
        console.error("Error setting sectorial engagements view:", error);
      }
    },
    set_chantier(chantier) {
      this.currentView = 'chantier';
      this.currentChantierId = chantier.id;
      
      const gristIds = chantier.grist_ids || [];
      
      const params = {
        view: 'chantier',
        chantier_id: chantier.id,
        chantier_name: chantier.name,
        label: chantier.name,
        sector: this.sector,
        grist_ids: gristIds, // Pass grist_ids directly for ChantierDetail
        query: {
          filter_by: [
            { field: "grist_ids", values: gristIds },
          ],
          time_period: {
            date_start: "2015-01-01",
            date_end: "2031-01-01",
          },
        },
        // Pass sorted leviers from navigation data
        sortedLeviers: chantier.sortedLeviers || []
      };
      this.$emit("params", params);
    },
  },
  mounted() {
    // Ensure sector is set before loading
    if (!this.sector) {
      this.sector = 'Synthèse';
    }
    this.loadChantiers();
  },
  watch: {
    sector: {
      handler(newSector, oldSector) {
        if (newSector && newSector !== oldSector) {
          // When sector changes, preserve the current view if it's valid for the new sector
          // Otherwise, load chantiers which will initialize with default view
          const currentView = this.currentView
          const currentChantierId = this.currentChantierId
          
          // Reload chantiers for the new sector
          this.loadChantiers()
          
          // After loading, try to preserve the view if it makes sense
          // This will be handled by loadChantiers based on initParams
        } else if (newSector) {
          this.loadChantiers()
        }
      },
      immediate: false,
    },
    initParams: {
      handler(newParams, oldParams) {
        // When initParams change (e.g., view, chantier_id, axe, sectorFilter), apply them
        if (newParams && newParams.sector === this.sector) {
          // Check if a meaningful change occurred (not just sector)
          const viewChanged = newParams.view !== (oldParams?.view);
          const chantierChanged = newParams.chantier_id !== (oldParams?.chantier_id);
          const axeChanged = newParams.axe !== (oldParams?.axe);
          const sectorFilterChanged = newParams.sectorFilter !== (oldParams?.sectorFilter);
          
          if (viewChanged || chantierChanged || axeChanged || sectorFilterChanged) {
            this.loadChantiers()
          }
        }
      },
      deep: true,
      immediate: false,
    },
  },
};
</script>

<style scoped>
a:hover:not([href]) {
  cursor: pointer;
  background-color: #f6f6f6;
}

/* Section title in sector menu: label only, no link styling */
.sidemenu-section-title {
  display: block;
  padding: 0.75rem 1rem;
  font-weight: 700;
  cursor: default;
  color: inherit;
  text-decoration: none;
}
.sidemenu-section-title:hover {
  background-color: transparent;
}

/* Submenu styles */
.fr-sidemenu__item > .fr-sidemenu__btn {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fr-sidemenu__item > .fr-sidemenu__btn::after {
  content: "";
  display: inline-block;
  width: 1rem;
  height: 1rem;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23161616' d='M12 15.586L6.707 10.293 8.121 8.879 12 12.757l3.879-3.878 1.414 1.414z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  transition: transform 0.3s ease;
}

.fr-sidemenu__item > .fr-sidemenu__btn[aria-expanded="true"]::after {
  transform: rotate(180deg);
}

.fr-sidemenu__item > .fr-sidemenu__btn:hover {
  background-color: #f6f6f6;
}

.fr-sidemenu__item > .fr-sidemenu__btn[aria-current="true"] {
  font-weight: 700;
}

.fr-sidemenu__item > .fr-collapse {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.fr-sidemenu__item > .fr-collapse.fr-collapse--expanded {
  max-height: 500px;
}

.fr-sidemenu__item > .fr-collapse > .fr-sidemenu__list {
  padding-left: 1rem;
  margin: 0;
  list-style: none;
}

.fr-sidemenu__item > .fr-collapse .fr-sidemenu__link {
  font-size: 0.9375rem;
  padding: 0.5rem 1rem;
}

/* Mobile: hide side navigation (use dropdown selector instead) */
@media (max-width: 991px) {
  .fr-sidemenu {
    display: none;
  }
}

/* Desktop: keep original styling */
@media (min-width: 769px) {
  .fr-sidemenu {
    position: sticky;
    top: 80px; /* Below sector selector */
    max-height: calc(100vh - 100px);
    overflow-y: auto;
  }
}
</style>
