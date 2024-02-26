<template>
  <div class="fr-container--fluid ">
    <div class="fr-grid-row">
      <div id="sidebar" class="fr-col-3">
        <!-- Intégration du composant de tags -->
        <tagsCard :tagsIndicateurs="tagsIndicateurs" @tags="updateSelection" class="fr-tags"></tagsCard>
      </div>
      <div class="fr-col">
        <div class="fr-container--fluid fr-container-page">
          <div v-if="!isapiloading">
            <adaptive-dashboard :params="myobj" :inputData="results_API" />
          </div>
          <div v-else>
            <p>Chargement des indicateurs...</p>
          </div>
          <div class="fr-grid-row">
            <a class="fr-link" href="https://www.gouvernement.fr/france-nation-verte" target="_self">
              France Nation Verte
            </a>
            <br>
          </div>
          <br>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { api } from '@/services/api.js'
import UpFooter from '../components/UpFooter.vue'
import AdaptiveDashboard from '../components/AdaptiveDashboard.vue'
import SideNavigation from '../components/SideNavigation.vue'
import TagsCard from '../components/TagsCard.vue'; // Import du composant de tagsCard

export default {
  name: 'DashboardPage',
  components: {
    UpFooter,
    AdaptiveDashboard,
    SideNavigation,
    TagsCard // Ajout du composant de tagsCard dans la section components
  },
  data() {
    return {
      isapiloading: true,
      myobj: {},
      results_API: [],
      tagsIndicateurs: "attenuation,biodiversite,ressouces,adaptation,sante", // Tags disponibles
    }
  },
  methods: {
    updateSelection(selectedTags) {
      // Construire la requête en fonction des tags sélectionnés
      const query = {
        // Construction de la requête en fonction des tags sélectionnés
      };
      this.fetchData(query);
    },
    async fetchData(query) {
      this.isapiloading = true;
      // Appel à l'API
      try {
        const response = await api('/requests/get_indicators', {
          method: 'POST',
          body: JSON.stringify(query)
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
    }
  }
}
</script>

<style scoped lang="scss">
  .fr-container-page {
    background-color: #F6F6F6;
    padding-top: 1.5rem;
    padding-left: 2.5rem;
    padding-right: 2.5rem;
    width: 100%;
  }
</style>
