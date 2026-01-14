<template>
  <nav role="navigation" class="fr-sidemenu fr-sidemenu__padding"
    aria-label="Navigation des volets">
    <div class="fr-sidemenu__inner">
      <button class="fr-sidemenu__btn" aria-controls="fr-sidemenu-wrapper" aria-expanded="false">
        Navigation
      </button>
      <div class="fr-collapse" id="fr-sidemenu-wrapper">
        <ul class="fr-sidemenu__list">
          <!-- Synthesis option -->
          <li class="fr-sidemenu__item">
            <a class="fr-sidemenu__link" 
              title="Synthèse"
              @click="set_synthesis"
              target="_self"
              :aria-current="currentView === 'synthesis'"
              tabindex="0"
              v-on:keyup.enter="set_synthesis"
            >
              Synthèse
            </a>
          </li>
          <!-- Chantiers -->
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
      currentView: 'synthesis',
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
        
        // Initialize with synthesis view
        if (!this.initParams || !this.initParams.view) {
          this.set_synthesis();
        } else if (this.initParams.view === 'chantier' && this.initParams.chantier_id) {
          const chantier = this.chantiers.find(c => c.id === this.initParams.chantier_id);
          if (chantier) {
            this.set_chantier(chantier);
          } else {
            this.set_synthesis();
          }
        }
      } catch (error) {
        console.error("Error loading chantiers:", error);
        this.chantiers = [];
      }
    },
    set_synthesis() {
      this.currentView = 'synthesis';
      this.currentChantierId = null;
      
      try {
        const mapping = planifecoMapping;
        if (!mapping) {
          console.warn("Planifeco mapping not available");
          return;
        }
        
        // Get all engagement and chantier grist IDs for current sector
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
        
        const chantierIds = [];
        if (mapping.chantiers) {
          Object.values(mapping.chantiers)
            .filter(chantier => chantier.sector === this.sector)
            .forEach(chantier => {
              if (chantier.grist_ids) {
                chantierIds.push(...chantier.grist_ids);
              }
            });
        }
        
        const allIds = [...engagementIds, ...chantierIds];
      
        const params = {
          view: 'synthesis',
          label: 'Synthèse',
          sector: this.sector,
          query: {
            filter_by: [
              { field: "grist_ids", values: allIds },
            ],
            time_period: {
              date_start: "2015-01-01",
              date_end: "2031-01-01",
            },
          },
        };
        this.$emit("params", params);
      } catch (error) {
        console.error("Error setting synthesis view:", error);
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
    this.loadChantiers();
  },
};
</script>

<style scoped>
a:hover:not([href]) {
  cursor: pointer;
  background-color: #f6f6f6;
}
</style>
