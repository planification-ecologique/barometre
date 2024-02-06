<template>
  <div class="fr-container">
    <div class="fr-grid-row">
      <div id="sidebar" class="fr-col-3">
        <nav class="fr-sidemenu fr-sidemenu--sticky-full-height fr-sidemenu__padding" role="navigation" aria-labelledby="fr-sidemenu-title">
      <SideNavigation/>
  </nav>
      </div>
      <div class="fr-col">
        <div class="fr-container fr-container-page">
          <div class="fr-grid-row">
            <div class="fr-col-12">
              <h1 class="fr-title">Vue d'ensemble</h1>
              <h4 class="fr-subtitle">Atténuation</h4>
            </div>
          </div>
          <adaptive-dashboard :inputData="inputGraph" :color="colors" />
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

import axios from 'axios'
import UpFooter from '../components/UpFooter.vue'
import GraphBox from '../components/GraphBox.vue'
import AdaptiveDashboard from '../components/AdaptiveDashboard.vue'
import SideNavigation from '../components/SideNavigation.vue'


export default {
  name: 'DashboardPage',
  components: {
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
          serie_values: {
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
      querySuccess: true,
      inputGraph: new Array(7).fill(BoxDataA),
      colors:  ['beige-gris-galet','brown-caramel','green-bourgeon','green-menthe']
    }
  },
  computed: {
  },
  methods: {

  },
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
}

</style>
