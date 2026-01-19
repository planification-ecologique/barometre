<template>
  <div class="fr-container--fluid">
    <!-- Sector selector - always visible, especially important on mobile -->
    <sector-selector :currentSector="currentSector" />
    
    <div class="fr-grid-row">
      <aside class="fr-col-12 fr-col-sm-12 fr-col-lg-3 fr-mb-sm-5w">
        <div id="sidebar" class="fr-ml-2w">
          <side-navigation
            v-on:params="updateSelection"
            :initParams="sidenav_initParams"
            :useStaging="useStaging"
            :sector="currentSector"
          />
        </div>
      </aside>
      <section class="fr-col">
        <div>
          <div class="fr-container--fluid fr-container-page">
            <div v-if="!isapiloading || myobj.view === 'about'">
              <!-- About view -->
              <about-view 
                v-if="myobj.view === 'about'"
                :params="myobj"
              />
              <!-- General Engagements view -->
              <general-engagements-view 
                v-else-if="myobj.view === 'general-engagements'"
                :params="myobj" 
                :inputData="results_API"
                :useStaging="useStaging"
              />
              <!-- General Chantiers view -->
              <general-chantiers-view 
                v-else-if="myobj.view === 'general-chantiers'"
                :params="myobj" 
                :inputData="results_API"
                :useStaging="useStaging"
              />
              <!-- Sectorial Engagements view -->
              <sectorial-engagements-view 
                v-else-if="myobj.view === 'sectorial-engagements'"
                :params="myobj" 
                :inputData="results_API"
                :useStaging="useStaging"
              />
              <!-- Chantier detail view -->
              <chantier-detail
                v-else-if="myobj.view === 'chantier'"
                :params="myobj"
                :chantierData="results_API"
                :useStaging="useStaging"
              />
              <!-- Legacy synthesis view -->
              <synthesis-view 
                v-else-if="myobj.view === 'synthesis'"
                :params="myobj" 
                :inputData="results_API"
                :useStaging="useStaging"
              />
              <!-- Fallback to adaptive dashboard -->
              <adaptive-dashboard 
                v-else
                :params="myobj" 
                :inputData="results_API"
              />
            </div>
            <div v-else>
              <p>Chargement des indicateurs...</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
// Import CSV data service instead of API
import { getIndicators } from "@/services/csvDataService.js";
import UpFooter from "../components/UpFooter.vue";
import AdaptiveDashboard from "../components/AdaptiveDashboard.vue";
import SideNavigation from "../components/SideNavigation.vue";
import ChantierDetail from "../components/ChantierDetail.vue";
import SynthesisView from "../components/SynthesisView.vue";
import GeneralEngagementsView from "../components/GeneralEngagementsView.vue";
import GeneralChantiersView from "../components/GeneralChantiersView.vue";
import SectorialEngagementsView from "../components/SectorialEngagementsView.vue";
import SectorSelector from "../components/SectorSelector.vue";
import AboutView from "../components/AboutView.vue";
import dsfrAnalytics from "../services/dsfr_analytics"

export default {
  name: "DashboardPage",
  props: {
    query: {
      type: String,
      default: null
    },
    useStaging: {
      type: Boolean,
      default: false
    }
  },
  components: {
    UpFooter,
    AdaptiveDashboard,
    SideNavigation,
    ChantierDetail,
    SynthesisView,
    GeneralEngagementsView,
    GeneralChantiersView,
    SectorialEngagementsView,
    SectorSelector,
    AboutView,
  },

  // Initialisation des données
  data() {
    return {
      isapiloading: true,
      myobj: {},
      results_API: [],
      sidenav_initParams: {},
      currentSector: 'Synthèse',
    };
  },
  created() {
    // Get sector from URL query parameter
    this.currentSector = this.$route.query.sector || 'Synthèse';
    
    // Initialize sidenav_initParams with sector
    this.sidenav_initParams = {
      sector: this.currentSector
    };
    
    // Initialisation de la requête selon les paramètres de l'URL
    if (this.$route.query.view) {
      this.sidenav_initParams.view = this.$route.query.view;
    }
    if (this.$route.query.chantier_id) {
      this.sidenav_initParams.chantier_id = this.$route.query.chantier_id;
    }
    // Legacy support
    if (this.$route.query.theme !== undefined || this.$route.query.levier !== undefined) {
      this.sidenav_initParams.id_theme = this.$route.query.theme;
      this.sidenav_initParams.id_levier = this.$route.query.levier;
    }
  },
  watch: {
    '$route.query.sector'(newSector, oldSector) {
      if (newSector && newSector !== oldSector) {
        this.currentSector = newSector;
        // Update sidenav_initParams when sector changes, preserving view if valid
        if (this.sidenav_initParams) {
          this.sidenav_initParams.sector = newSector;
          
          // Preserve view if it's valid for the new sector
          const currentView = this.$route.query.view
          const currentChantierId = this.$route.query.chantier_id
          
          if (newSector === 'Synthèse') {
            // For Synthèse, preserve about, general-engagements and general-chantiers
            if (currentView === 'about' || currentView === 'general-engagements' || currentView === 'general-chantiers') {
              this.sidenav_initParams.view = currentView
            } else {
              // Default to about
              this.sidenav_initParams.view = 'about'
              delete this.sidenav_initParams.chantier_id
            }
          } else {
            // For other sectors, preserve sectorial-engagements or chantier
            if (currentView === 'sectorial-engagements') {
              this.sidenav_initParams.view = 'sectorial-engagements'
              delete this.sidenav_initParams.chantier_id
            } else if (currentView === 'chantier' && currentChantierId) {
              // Preserve chantier_id - SideNavigation will check if it exists in new sector
              this.sidenav_initParams.view = 'chantier'
              this.sidenav_initParams.chantier_id = currentChantierId
            } else {
              // Default to sectorial-engagements
              this.sidenav_initParams.view = 'sectorial-engagements'
              delete this.sidenav_initParams.chantier_id
            }
          }
        }
      }
    },
    '$route.query'(newQuery) {
      // Update sector when query changes
      if (newQuery.sector) {
        this.currentSector = newQuery.sector;
        if (this.sidenav_initParams) {
          this.sidenav_initParams.sector = newQuery.sector;
          
          // Update view and chantier_id if present
          if (newQuery.view) {
            this.sidenav_initParams.view = newQuery.view
          }
          if (newQuery.chantier_id) {
            this.sidenav_initParams.chantier_id = newQuery.chantier_id
          } else {
            delete this.sidenav_initParams.chantier_id
          }
        }
      }
    }
  },
  methods: {
    // Mise à jour de la sélection dans le menu
    updateSelection(selectedValue) {
      if (selectedValue != undefined) {
        this.myobj = selectedValue;
        // Only fetch data if not the about view
        if (selectedValue.view !== 'about' && selectedValue.query) {
          this.fetchData(selectedValue.query);
        } else if (selectedValue.view === 'about') {
          this.isapiloading = false;
        }

        // Navigation vers la page de dashboard et affichage dans l'URL
        try {
          const routeName = this.useStaging ? "staging-dashboard" : "dashboard";
          const query = {
            sector: this.currentSector
          };
          
          // Set view and related params
          if (selectedValue.view === 'general-engagements') {
            query.view = 'general-engagements';
          } else if (selectedValue.view === 'general-chantiers') {
            query.view = 'general-chantiers';
          } else if (selectedValue.view === 'sectorial-engagements') {
            query.view = 'sectorial-engagements';
          } else if (selectedValue.view === 'chantier' && selectedValue.chantier_id) {
            query.view = 'chantier';
            query.chantier_id = selectedValue.chantier_id;
          } else if (selectedValue.view === 'synthesis') {
            query.view = 'synthesis';
          } else if (selectedValue.view === 'about') {
            query.view = 'about';
          }
          
          // Only update route if query params changed
          const currentView = this.$route.query.view;
          const currentChantierId = this.$route.query.chantier_id;
          const currentSector = this.$route.query.sector;
          
          if (query.view !== currentView || query.chantier_id !== currentChantierId || query.sector !== currentSector) {
            this.$router.push({
              name: routeName,
              query: query
            });
          }
        } catch (error) {
          console.error("Erreur dans le chargement de la navigation : ", error);
        }
      }
    },
    // Récupération des données de l'API
    async fetchData(query) {
      this.isapiloading = true;
      // Use CSV data service instead of API
      try {
        const response = await getIndicators(query, this.useStaging ? 'staging' : 'production');
        // Set results directly from CSV data service
        this.results_API = response.results;
        this.isapiloading = false;
      } catch (error) {
        console.error("Erreur dans le chargement des données CSV : ", error);
      }
    },
  },
  mounted(){
    dsfrAnalytics({
      path: "/dashboard",
      name: "dashboard",
      segment: "tableau_de_bord",
      labels: ['contenu_liste', 'tableau_de_bord', '', '', ''],
      template: "contenu_liste",
      group: "tableau_de_bord"
    })
  }
};
</script>
<style scoped lang="scss">
.fr-container-page {
  background-color: #f6f6f6;
  padding-top: 1.5rem;
  padding-left: 2.5rem;
  padding-right: 2.5rem;
  width: 100%;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .fr-container-page {
    padding-left: 1rem;
    padding-right: 1rem;
    padding-top: 1rem;
  }
  
  #sidebar {
    margin-left: 0 !important;
  }
}
</style>
