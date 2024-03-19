<template>
  <div class="fr-container--fluid ">
    <div class="fr-grid-row">
      <div id="sidebar" class="col-12 col-sm-6 fr-ml-2w">
        <side-navigation class="sidenavPosition" v-on:params="updateSelection" :initParams="sidenav_initParams"/>
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


export default {
  name: 'DashboardPage',
  components: {
    UpFooter,
    AdaptiveDashboard,
    SideNavigation
  },
  data() {
    return {
pageTitle: "Baromètre SGPE - Tableaux de bord",

      isapiloading: true,
      myobj: {},
      results_API: [],
      sidenav_initParams: {}
    }
  },
  created() {
    // Initialisation de la requête selon les paramètres de l'URL
    if (this.$route.query.theme !== undefined || this.$route.query.levier !== undefined) {
      this.sidenav_initParams.id_theme = this.$route.query.theme
      this.sidenav_initParams.id_levier =  this.$route.query.levier
    }
  },
  methods: {
    updateSelection(selectedValue) {
      
      if(selectedValue != undefined) {
        this.myobj = selectedValue
        this.fetchData(selectedValue.query)

        // Navigation vers la page de dashboard et affichage dans l'URL
        try {
          var new_theme = selectedValue.query.filter_by[0].values[0]
          var new_levier = selectedValue.query.filter_by[1].values[0]
          
          if (new_theme !== this.$route.query.theme || new_levier !== this.$route.query.levier){
            this.$router.push({ name: 'dashboard', query: { theme: new_theme, levier: new_levier } })
          }
        } catch (error) {
          console.error("Erreur dans le chargement de la navigation : ", error);
        }
       
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

// #sidebar{
//  position: fixed;
//   height: calc(100vh - 5rem); /* Ajustez la hauteur de la sidebar pour qu'elle remplisse l'espace restant */
//   overflow-y: auto;}

.sidenavPosition{
  position: fixed;
  z-index: 1000;
}


.fr-container-page {
  background-color: #F6F6F6;
  width: 100%;
}
@media (max-width: 767px) { 
  .sidenavPosition {
    position: relative;
     margin-top: 7.25rem
  }
}
@media (min-width: 768px) { 
  .fr-container-page {
    padding-left: 23.5rem;
    padding-right: 2.5rem;
  }

  
}

</style>
