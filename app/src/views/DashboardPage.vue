<template>
  <div class="fr-container--fluid ">
    <div class="fr-grid-row">
      <div id="sidebar" class="fr-col-3 fr-col-sm-3 fr-col-lg-3">
        <side-navigation v-on:params="updateSelection" :initParams="sidenav_initParams"/>
      </div>
      <div class="fr-col">
        <div class="fr-container--fluid fr-container-page">
          <div v-if="!isapiloading">
            <adaptive-dashboard :params=myobj :inputData=results_API />
          </div>
          <div v-else>
            <p>Chargement des indicateurs...</p>
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
import router from '../router.js'

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
      sidenav_initParams: {}
    }
  },
  created() {
    // Initialisation de la requête selon les paramètres de l'URL
    if (this.$route.params.theme == undefined || this.$route.params.levier == undefined) {
      this.$router.push({ name: 'dashboard', params: { theme: 'transverse', levier: 'emissions--puits' } })
    } 

    var query_init = this.set_query_init(this.$route.params.theme, this.$route.params.levier)
    this.myobj = query_init
    this.fetchData(query_init.query)

    var initLoadingParams = {
      "id_theme": this.$route.params.theme,
      "id_levier": this.$route.params.levier,
    }
    this.sidenav_initParams = initLoadingParams

  },
  methods: {
    set_query_init (id_theme, id_levier) {
      // console.log(JSON.stringify(levier))
      var params = {
        "query" : {
          "filter_by": [
            { "field": "id_theme",
              "values": [id_theme],
            },
            { "field": "id_levier",
              "values": [id_levier]
            }
          ],
          "time_period": {
            "date_start": "2015-01-01",
            "date_end": "2031-01-01"
          }
        }
      } 
      return params
    },
    updateSelection(selectedValue) {
      if(selectedValue != undefined) {
        this.myobj = selectedValue
        // Navigation vers la page de dashboard et affichage dans l'URL
        try {
          this.$router.push({ name: 'dashboard', params: { theme: selectedValue.query.filter_by[0].values[0], levier: selectedValue.query.filter_by[1].values[0] } })
        } catch (error) {
          console.error("Erreur dans le chargement de la navigation : ", error);
        }
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
