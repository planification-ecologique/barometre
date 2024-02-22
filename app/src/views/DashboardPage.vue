<template>
  <div class="fr-container--fluid">
    <div class="fr-grid-row">
      <div id="sidebar" class="fr-col-3">
        <SideNavigation @selectionChanged="updateSelection"></SideNavigation>
      </div>
      <div class="fr-col">
        <div class="fr-container--fluid fr-container-page">
          <div class="fr-grid-row">
            <div class="fr-col-12">
              <h1 class="fr-title">{{ selectedValueForH1[1] }}</h1>
              <h4 class="fr-subtitle">{{ selectedValueForH2[1] }}</h4>
            </div>
          </div>
          <div v-if="results_API.length > 0">
            <adaptive-dashboard :inputData="results_API" :color="colors"/>
          </div>
          <div v-else>
            <p>Chargement en cours...</p>
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
import GraphBox from '../components/GraphBox.vue'
import AdaptiveDashboard from '../components/AdaptiveDashboard.vue'
import SideNavigation from '../components/SideNavigation.vue'
import BarChart from '../components/components_dsfr/BarChart.vue'


export default {
  name: 'DashboardPage',
  components: {
    BarChart,
    UpFooter,
    GraphBox,
    AdaptiveDashboard,
    SideNavigation
  },
  data() {  
    let BoxDataA= {
          title: 'Voyages covoiturés via plateformes',
          update_date: '23/01/2024',
          description: "Description",
          source: "Talkwalker",
          trendValue: -1,
          unit: "Millions de tonnes en équivalent CO2",
          values: {
          // x: [["2017", "2018", "2019"], ["2017", "2018", "2019"], ["2017", "2018", "2019"]],
          x: [["2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030"], 
            ["2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030"], 
            ["2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030"],
            ["2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030"]],
          y: [
            [20, 18, 15, 13, 12, 16, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 15, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 14, 11, 8, 7, 6, 5, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3]
          ],
          name: ['Historique', 'Année en cours', 'Projection', 'Cible']
          },
          horizontal: false,
          stacked: true
      }
      // Avec les données de l'API on peut faire une boucle pour remplir inputGraph



    return {
      selectedValueForH1: ['transverse', 'Transverse'],
      selectedValueForH2: ['emissions--puits', 'Emissions / Puits'],
      querySuccess: true,
      inputGraph: new Array(7).fill(BoxDataA),
      colors:  ['beige-gris-galet','brown-caramel','green-bourgeon','green-menthe'],

      ls_responseIndicateurs: [],
      API_loading: false,

      currentYear: "2023-01-01",
      transformedData: null,
      

      // Pour les filtres sur API
      startDateFilter: "2015-01-01",
      endDateFilter: "2031-01-01",


      tagVariables: ["émissions", "atténuation"],

      filterObject: {
        filter_by: [],
        time_period: {
          date_start: "2015-01-01",
          date_end: "2031-01-01",
        },
      },
      results_API: [],

    }
  },
  computed: {
    
  },
  methods: {

    sortXData(x, y) {
    // Création d'une nouvelle liste qui combine les dates et les valeurs
    let combinedData = x.map((date, index) => ({ date, value: y[index] }));

    // Tri de la liste combinée en fonction des dates
    combinedData.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Séparation des listes triées
    let sortedX = combinedData.map(item => item.date);
    let sortedY = combinedData.map(item => item.value);

    return { x: sortedX, y: sortedY };

    },

    removeUndefinedData(x, y) {
      // on vérifie que les listes x et y font la même longueur 
      if (x.length !== y.length) {
        console.error("Les listes x et y n'ont pas la même longueur");
        return;
      } else {
        // On cherche les indices des valeurs différente de "" dans y et on conserve ces valeurs
        let indices = y.map((item, index) => item !== "" ? index : "").filter(String);
        let x_filtered = indices.map(index => x[index]);
        let y_filtered = indices.map(index => y[index]);

        return { x_data: x_filtered, y_data: y_filtered };
      }

    },
    async fetchData() {

      // Remplissage des filtres
      // this.filterObject.time_period.date_start = this.startDateFilter;
      // this.filterObject.time_period.date_end = this.endDateFilter;

      // console.log("selectedValueForH1", this.selectedValueForH1)
      // console.log("selectedValueForH2", this.selectedValueForH2)

      var query = {
        "filter_by": [
          {      
            "field": "id_theme",
            "values":  [this.selectedValueForH1[0]]   
          },
        {      
            "field": "id_levier",
            "values": [this.selectedValueForH2[0]]
          }
        ],
        "time_period": {
          "date_start": "2015-01-01",
          "date_end": "2031-01-01"
        }
      }

      // console.log("query", query);

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
        
      } catch (error) {
        console.error("Erreur dans le chargement des données : ", error);
      }

    },



    updateSelection(selectedValue) {
      // Mettre à jour les données en fonction de la sélection de la barre latérale
      this.selectedValueForH1 = selectedValue[0]; // ou effectuez toute logique nécessaire
      this.selectedValueForH2 = selectedValue[1]; // ou effectuez toute logique nécessaire
      this.fetchData();
    },


  },
  mounted() {
    this.fetchData();    
  }
}
</script>
  
<style scoped lang="scss">
.flex-container {
  max-width: none;
  overflow: hidden;
}
.fr-container-page {
    background-color: #F6F6F6;
    padding-top: 1.5rem;
    padding-left: 2.5rem;
    padding-right: 2.5rem;
    width: 100%;

}
.fr-title {
  margin-bottom: 0.625rem;
}
.fr-subtitle {
  font-weight: 400;
}
$top: 2.25rem;
@media (max-width: 62em) {
  .fr-sidemenu {
    left: 0;
    margin: 0;
    position: fixed;
    top: $top;
    width: 100%;
    z-index: 5000;

    &.displayed {
      display: flex !important;
    }

    &::before {
      content: "";
      background-color: rgba(22, 22, 22, 0.64);
      height: 100%;
      left: 0;
      position: fixed;
      top: 0;
      width: 100%;
      z-index: -1;
    }
  }
}
.fr-sidemenu__padding {
  padding-right: 0rem !important;
  height: min-content;
}

</style>
