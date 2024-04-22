<template>
  <div class="fr-container--fluid">
    <div class="fr-grid-row">
      <aside>
        <div id="sidebar" class="col-12 col-sm-6 fr-ml-2w">
          <side-navigation
            v-on:params="updateSelection"
            :initParams="sidenav_initParams"
            :expanded="isSideNavExpanded"
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
import { api } from "@/services/api.js";
import UpFooter from "../components/UpFooter.vue";
import AdaptiveDashboard from "../components/AdaptiveDashboard.vue";
import SideNavigation from "../components/SideNavigation.vue";
import dsfrAnalytics from "../services/dsfr_analytics"

export default {
  name: "DashboardPage",
  components: {
    UpFooter,
    AdaptiveDashboard,
    SideNavigation,
  },
  data() {
    return {
      isapiloading: true,
      myobj: {},
      results_API: [],
      sidenav_initParams: {},
      isSideNavExpanded: false, 
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
    updateSelection(selectedValue) {
      if (selectedValue != undefined) {
        this.myobj = selectedValue;
        this.fetchData(selectedValue.query);

        // Navigation vers la page de dashboard et affichage dans l'URL
        try {
          var new_theme = selectedValue.query.filter_by[0].values[0];
          var new_levier = selectedValue.query.filter_by[1].values[0];

          if (new_theme !== this.$route.query.theme || new_levier !== this.$route.query.levier) {
            this.$router.push(
              {name: "dashboard",
               query: { theme: new_theme, levier: new_levier }
            });
          }
        } catch (error) {
          console.error("Erreur dans le chargement de la navigation : ", error);
        }
      }
    },
    async fetchData(query) {
      this.isapiloading = true;
      // Appel à l'API
      try {
        const response = await api("/requests/get_indicators", {
          method: "POST",
          body: JSON.stringify(query),
        });

        if (!response) {
          throw new Error("Erreur lors de l'appel à l'API");
        }

        // Récupération des données
        let results = response;
        this.results_API = results.data.results;
        // console.log("results_API--------", JSON.stringify(this.results_API));
        this.isapiloading = false;
      } catch (error) {
        console.error("Erreur dans le chargement des données : ", error);
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
    });
    this.checkScreenSize(); // Appel à la méthode pour définir l'état initial de la side navigation
    window.addEventListener('resize', this.checkScreenSize); // Ajout de l'écouteur d'événement
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkScreenSize); // Suppression de l'écouteur d'événement lors de la destruction du composant
  },
  methods: {
    checkScreenSize() {
      // Vérifier la taille de l'écran pour déterminer si la side navigation doit être fermée par défaut sur les écrans de tablette
      this.isSideNavExpanded = window.innerWidth >= 768 ? true : false;
    },
  },
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
