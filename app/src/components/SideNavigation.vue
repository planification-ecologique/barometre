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
            <!-- Chantiers menu -->
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
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>
<script>
import planifecoMapping from "@/utils/planifeco_mapping.js";

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
    loadChantiers() {
      // Load chantiers from mapping
      try {
        const mapping = planifecoMapping;
        if (!mapping || !mapping.chantiers) {
          console.warn("Planifeco mapping not available");
          this.chantiers = [];
          return;
        }
        
        // Filter chantiers by sector
        this.chantiers = Object.values(mapping.chantiers)
          .filter(chantier => chantier.sector === this.sector)
          .map((chantier, index) => ({
            id: chantier.id,
            name: chantier.name || `Chantier ${index + 1}`,
            grist_ids: chantier.grist_ids || [],
            leviers: chantier.leviers || []
          }));
        
        // For Synthèse sector, load taxonomy axes and chantier sectors
        if (this.sector === 'Synthèse') {
          this.loadTaxonomyAxes();
          this.loadChantierSectors();
        }
        
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
        const mapping = planifecoMapping;
        if (!mapping || !mapping.engagements) return;
        
        // Get unique taxonomy axes from Synthèse engagements
        const axesSet = new Set();
        Object.values(mapping.engagements)
          .filter(eng => eng.sector === 'Synthèse')
          .forEach(eng => {
            if (eng.taxonomy_axe) {
              axesSet.add(eng.taxonomy_axe);
            }
          });
        
        this.taxonomyAxes = Array.from(axesSet);
      } catch (error) {
        console.error("Error loading taxonomy axes:", error);
        this.taxonomyAxes = [];
      }
    },
    loadChantierSectors() {
      try {
        const mapping = planifecoMapping;
        if (!mapping || !mapping.chantiers || !mapping.sectors) return;
        
        // Get sectors that have chantiers (excluding Synthèse)
        const sectorsWithChantiers = new Set();
        Object.values(mapping.chantiers).forEach(chantier => {
          if (chantier.sector && chantier.sector !== 'Synthèse') {
            sectorsWithChantiers.add(chantier.sector);
          }
        });
        
        // Preserve order from mapping.sectors
        this.chantierSectors = mapping.sectors.filter(s => 
          s !== 'Synthèse' && sectorsWithChantiers.has(s)
        );
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
        const mapping = planifecoMapping;
        if (!mapping) {
          console.warn("Planifeco mapping not available");
          return;
        }
        
        // Get all engagement grist IDs for Synthèse sector
        const engagementIds = [];
        if (mapping.engagements) {
          Object.values(mapping.engagements)
            .filter(eng => eng.sector === 'Synthèse')
            .forEach(eng => {
              if (eng.grist_ids) {
                engagementIds.push(...eng.grist_ids);
              }
            });
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
        const mapping = planifecoMapping;
        if (!mapping) {
          console.warn("Planifeco mapping not available");
          return;
        }
        
        // Get all chantier grist IDs
        const chantierIds = [];
        if (mapping.chantiers) {
          Object.values(mapping.chantiers)
            .filter(chantier => chantier.sector !== 'Synthèse')
            .forEach(chantier => {
              if (chantier.grist_ids) {
                chantierIds.push(...chantier.grist_ids);
              }
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
        const mapping = planifecoMapping;
        if (!mapping) {
          console.warn("Planifeco mapping not available");
          return;
        }
        
        // Get engagement grist IDs for Synthèse sector, optionally filtered by axe
        const engagementIds = [];
        if (mapping.engagements) {
          Object.values(mapping.engagements)
            .filter(eng => eng.sector === 'Synthèse' && (!axe || eng.taxonomy_axe === axe))
            .forEach(eng => {
              if (eng.grist_ids) {
                engagementIds.push(...eng.grist_ids);
              }
            });
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
        const mapping = planifecoMapping;
        if (!mapping) {
          console.warn("Planifeco mapping not available");
          return;
        }
        
        // Get chantier grist IDs, optionally filtered by sector
        const chantierIds = [];
        if (mapping.chantiers) {
          Object.values(mapping.chantiers)
            .filter(chantier => !sectorFilter || chantier.sector === sectorFilter)
            .forEach(chantier => {
              if (chantier.grist_ids) {
                chantierIds.push(...chantier.grist_ids);
              }
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
        const mapping = planifecoMapping;
        if (!mapping) {
          console.warn("Planifeco mapping not available");
          return;
        }
        
        // Get all engagement grist IDs for current sector
        const engagementIds = [];
        if (mapping.engagements) {
          Object.values(mapping.engagements)
            .filter(eng => eng.sector === this.sector)
            .forEach(eng => {
              if (eng.grist_ids) {
                engagementIds.push(...eng.grist_ids);
              }
            });
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
      
      const params = {
        view: 'chantier',
        chantier_id: chantier.id,
        chantier_name: chantier.name,
        label: chantier.name,
        sector: this.sector, // Ensure sector is passed
        query: {
          filter_by: [
            { field: "grist_ids", values: chantier.grist_ids || [] },
          ],
          time_period: {
            date_start: "2015-01-01",
            date_end: "2031-01-01",
          },
        },
        leviers: chantier.leviers || []
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
      handler(newParams) {
        // When initParams change (e.g., view or chantier_id), reload to apply them
        if (newParams && newParams.sector === this.sector) {
          this.loadChantiers()
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

/* Mobile optimizations for side navigation */
@media (max-width: 768px) {
  .fr-sidemenu {
    margin-bottom: 1rem;
  }
  
  .fr-sidemenu__btn {
    width: 100%;
    font-weight: 600;
    background-color: var(--background-action-low-blue-france, #e3e3fd);
    border: 1px solid var(--border-action-low-blue-france, #cacafb);
  }
  
  .fr-sidemenu__btn:hover {
    background-color: var(--background-action-low-blue-france-hover, #d1d1fc);
  }
  
  .fr-sidemenu__link {
    padding: 0.75rem 1rem;
    font-size: 0.9375rem;
  }
  
  .fr-sidemenu__link[aria-current="page"] {
    background-color: var(--background-action-low-blue-france, #e3e3fd);
    font-weight: 600;
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
