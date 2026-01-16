<template>
  <nav role="navigation" class="fr-sidemenu fr-sidemenu__padding"
    aria-label="Navigation des volets">
    <div class="fr-sidemenu__inner">
      <button class="fr-sidemenu__btn" aria-controls="fr-sidemenu-wrapper" aria-expanded="false">
        Navigation
      </button>
      <div class="fr-collapse" id="fr-sidemenu-wrapper">
        <ul class="fr-sidemenu__list">
          <!-- Général sector: Nos Engagements and Nos Chantiers -->
          <template v-if="sector === 'Général'">
            <li class="fr-sidemenu__item">
              <a class="fr-sidemenu__link" 
                title="Nos Engagements"
                @click="set_general_engagements"
                target="_self"
                :aria-current="currentView === 'general-engagements'"
                tabindex="0"
                v-on:keyup.enter="set_general_engagements"
              >
                Nos Engagements
              </a>
            </li>
            <li class="fr-sidemenu__item">
              <a class="fr-sidemenu__link" 
                title="Nos Chantiers"
                @click="set_general_chantiers"
                target="_self"
                :aria-current="currentView === 'general-chantiers'"
                tabindex="0"
                v-on:keyup.enter="set_general_chantiers"
              >
                Nos Chantiers
              </a>
            </li>
          </template>
          
          <!-- Sectoriel: Nos Engagements and Chantiers menu -->
          <template v-else>
            <li class="fr-sidemenu__item">
                  <a class="fr-sidemenu__link" 
                title="Nos Engagements"
                @click="set_sectorial_engagements"
                    target="_self"
                :aria-current="currentView === 'sectorial-engagements'"
                    tabindex="0"
                v-on:keyup.enter="set_sectorial_engagements"
                  >
                Nos Engagements
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
      default: 'Général'
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
        
        // Initialize with view from initParams, or default view based on sector
        if (!this.initParams || !this.initParams.view) {
          // No view specified - use default for sector
          if (this.sector === 'Général') {
            this.set_general_engagements();
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
            if (this.sector === 'Général') {
              this.set_general_engagements();
            } else {
              this.set_sectorial_engagements();
            }
          }
        } else if (this.initParams.view === 'general-engagements') {
          // Only valid for Général sector
          if (this.sector === 'Général') {
            this.set_general_engagements();
          } else {
            // Invalid view for this sector - use default
            this.set_sectorial_engagements();
          }
        } else if (this.initParams.view === 'general-chantiers') {
          // Only valid for Général sector
          if (this.sector === 'Général') {
            this.set_general_chantiers();
          } else {
            // Invalid view for this sector - use default
            this.set_sectorial_engagements();
          }
        } else if (this.initParams.view === 'sectorial-engagements') {
          // Valid for all sectors except Général
          if (this.sector === 'Général') {
            // Invalid view for Général - use default
            this.set_general_engagements();
          } else {
            this.set_sectorial_engagements();
          }
        } else {
          // Unknown view - use default
          if (this.sector === 'Général') {
            this.set_general_engagements();
          } else {
            this.set_sectorial_engagements();
          }
        }
      } catch (error) {
        console.error("Error loading chantiers:", error);
        this.chantiers = [];
      }
    },
    set_general_engagements() {
      this.currentView = 'general-engagements';
      this.currentChantierId = null;
      
      try {
        const mapping = planifecoMapping;
        if (!mapping) {
          console.warn("Planifeco mapping not available");
          return;
        }
        
        // Get all engagement grist IDs for Général sector
        const engagementIds = [];
        if (mapping.engagements) {
          Object.values(mapping.engagements)
            .filter(eng => eng.sector === 'Général')
            .forEach(eng => {
              if (eng.grist_ids) {
                engagementIds.push(...eng.grist_ids);
              }
            });
        }
      
        const params = {
          view: 'general-engagements',
          label: 'Nos Engagements',
          sector: 'Général',
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
    set_general_chantiers() {
      this.currentView = 'general-chantiers';
      this.currentChantierId = null;
      
      try {
        const mapping = planifecoMapping;
        if (!mapping) {
          console.warn("Planifeco mapping not available");
          return;
        }
        
        // Get all chantier grist IDs from all sectors
        const chantierIds = [];
        if (mapping.chantiers) {
          Object.values(mapping.chantiers).forEach(chantier => {
            if (chantier.grist_ids) {
              chantierIds.push(...chantier.grist_ids);
            }
          });
        }
      
        const params = {
          view: 'general-chantiers',
          label: 'Nos Chantiers',
          sector: 'Général',
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
          label: 'Nos Engagements',
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
      this.sector = 'Général';
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
