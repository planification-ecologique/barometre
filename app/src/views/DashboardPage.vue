<template>
  <div class="fr-container--fluid">
    <div class="fr-grid-row">
      <aside class="fr-col-12 fr-col-sm-12 fr-col-lg-3 fr-mb-sm-5w">
        <div id="sidebar" class="fr-ml-2w">
          <side-navigation
            v-on:params="updateSelection"
            :initParams="sidenav_initParams"
            :useStaging="useStaging"
          />
        </div>
      </aside>
      <section class="fr-col">
        <div>
          <div class="fr-container--fluid fr-container-page">
            <div v-if="!isapiloading">
              <adaptive-dashboard :params="myobj" :inputData="results_API" />
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
  },

  // Initialisation des données
  data() {
    return {
      isapiloading: true,
      myobj: {},
      results_API: [],
      sidenav_initParams: {},
    };
  },
  created() {
    // Initialisation de la requête selon les paramètres de l'URL
    if ( this.$route.query.theme !== undefined || this.$route.query.levier !== undefined) {
      this.sidenav_initParams.id_theme = this.$route.query.theme;
      this.sidenav_initParams.id_levier = this.$route.query.levier;
    }
  },
  methods: {
    // Mise à jour de la sélection dans le menu
    updateSelection(selectedValue) {
      if (selectedValue != undefined) {
        this.myobj = selectedValue;
        this.fetchData(selectedValue.query);

        // Navigation vers la page de dashboard et affichage dans l'URL
        try {
          var new_theme = selectedValue.query.filter_by[0].values[0];
          var new_levier = selectedValue.query.filter_by[1].values[0];

          if (new_theme !== this.$route.query.theme || new_levier !== this.$route.query.levier) {
            // Determine which route name to use based on whether we're in staging
            const routeName = this.useStaging ? "staging-dashboard" : "dashboard";
            
            this.$router.push({
              name: routeName,
              query: { theme: new_theme, levier: new_levier }
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
</style>
