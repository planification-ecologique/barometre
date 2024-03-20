<template>
  <div class="fr-container--fluid">
    <div class="fr-grid-row fr-grid-row--left">
      <div class="fr-col-3 fr-col-lg-1 fr-unhidden-lg">
        <side-navigation
          class="sidenavPosition fr-ml-3w"
          v-on:params="updateSelection"
          :initParams="sidenav_initParams"
        />
      </div>
      <div class="fr-col">
        <div class="fr-grid-row fr-grid-row--left fr-container-page">
          <div v-if="!isapiloading">
            <adaptive-dashboard
              class="fr-col-12 fr-col-lg-10 fr-col-offset-lg-1 fr-ml-4w"
              :params="myobj"
              :inputData="results_API"
            />
          </div>
          <div class="fr-ml-3w fr-mt-w" v-else>
            <p>Chargement des indicateurs...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { api } from "@/services/api.js";
import UpFooter from "../components/UpFooter.vue";
import AdaptiveDashboard from "../components/AdaptiveDashboard.vue";
import SideNavigation from "../components/SideNavigation.vue";

export default {
  name: "DashboardPage",
  components: {
    UpFooter,
    AdaptiveDashboard,
    SideNavigation,
  },
  data() {
    return {
      pageTitle: "Baromètre SGPE - Tableaux de bord",
      isapiloading: true,
      myobj: {},
      results_API: [],
      sidenav_initParams: {},
      // isSidebarFixed: false,
      // sidebarWidth: 325,
    };
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

          if (
            new_theme !== this.$route.query.theme ||
            new_levier !== this.$route.query.levier
          ) {
            this.$router.push({
              name: "dashboard",
              query: { theme: new_theme, levier: new_levier },
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
        this.isapiloading = false;
      } catch (error) {
        console.error("Erreur dans le chargement des données : ", error);
      }
    },
  },
  created() {
    // Initialisation de la requête selon les paramètres de l'URL
    if (
      this.$route.query.theme !== undefined ||
      this.$route.query.levier !== undefined
    ) {
      this.sidenav_initParams.id_theme = this.$route.query.theme;
      this.sidenav_initParams.id_levier = this.$route.query.levier;
    }
  },
};
</script>

<style scoped lang="scss">
.fr-container-page {
  background-color: #f6f6f6;
  margin-left: 3rem;
}

@media only screen and (max-width: 768px) {
  .fr-container-page {
    margin-left: 0; // Réinitialiser la marge à zéro pour les appareils mobiles
  }

  .fr-ml-3w, .fr-ml-4w {
    margin-left: 0; // Réinitialiser les marges spécifiques pour les appareils mobiles
  }
}
</style>
