<template>
  <div class="fr-container--fluid reset-overflow">
    <div class="fr-grid-row">
      <div id="sidebar" class="fr-col-3">
        <side-navigation v-on:params="updateSelection"/>
      </div>
      <div class="fr-col">
        <div class="fr-container--fluid fr-container-page">
          <div v-if="!isapiloading">
            <adaptive-dashboard :params=myobj :inputData=results_API />
          </div>
          <div v-else>
            <p>Chargement des indicateurs...</p>
          </div>
          <div class="fr-grid-row">
            <div class="fr-col-12">
                  <h2 class="fr-footer__body fr-btns-group--between">Les axes pour transformer la société
                    <a class="fr-link fr-icon-arrow-right-line fr-link--icon-right" href="#">Suivre les réformes</a>
                  </h2>
              <up-footer></up-footer>
            </div>
          </div>  
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

export default {
  name: 'DashboardPage',
  components: {
    UpFooter,
    AdaptiveDashboard,
    SideNavigation
  },
  data() {
    return {
      isapiloading: true,
      myobj: {},
      results_API: [],
    }
  },
  methods: {
    updateSelection(selectedValue) {
      if(selectedValue != undefined) {
        this.myobj = selectedValue
        this.fetchData(selectedValue.query)
      }
    },
    async fetchData(query) {
      this.isapiloading = true
      // Appel à l'API
      try {
        const response = await api('/requests/get_indicators', {
          method: 'POST',
          body: JSON.stringify(query)
        });

        if(!response) {
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
