<template>
  <div class="fr-container">
    <div class="fr-grid-row">
      <div id="sidebar" class="fr-col-3">
        <side-bar></side-bar>
      </div>
      <div class="fr-col">
        <div class="fr-container fr-container-page">
          <div class="fr-grid-row">
            <div class="fr-col-12">
              <h1 class="fr-title">Vue d'ensemble</h1>
              <h4 class="fr-subtitle">Atténuation</h4>
            </div>
          </div>
          <div class="fr-grid-row fr-grid-row--gutters fr-py-md-3w">
            <div class="fr-col-12 fr-col-sm-6 fr-col-md-6 fr-col-xl-6">
              <graph-box :dataObj=BoxDataA :color=colors> </graph-box>
            </div>
            <div class="fr-col-12 fr-col-sm-6 fr-col-md-6 fr-col-xl-6">
              <graph-box :dataObj=BoxDataA :color=colors> </graph-box>
            </div>
          </div>
          <div class="fr-grid-row fr-grid-row--gutters fr-mb-1w">
            <div class="fr-col-12">
              <graph-box :dataObj=BoxDataA :color=colors> </graph-box>
            </div>
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

import axios from 'axios'
import SideBar from '../components/SideBar.vue'
import UpFooter from '../components/UpFooter.vue'
import GraphBox from '../components/GraphBox.vue'


export default {
  name: 'Secret',
  components: {
    SideBar,
    UpFooter,
    GraphBox


},
  data() {
    return {
      querySuccess: true,

      colors:  ['beige-gris-galet','brown-caramel','green-bourgeon','green-menthe'],
      BoxDataA: {
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
      },
    }
  },
  computed: {
  },
  methods: {

  },
}
</script>
  
<style scoped>

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

</style>
