<template>
  <div class="fr-container fr-container-page">
    <div class="fr-grid-row">
      <div class="fr-col-12">
        <h1 class="fr-title">Tag</h1>
        <h4 class="fr-subtitle">Atténuation</h4>
        <tags-dsfr v-on:tags=set_tags class="fr-tags"></tags-dsfr>
      </div>
    </div>
    <div class="fr-grid-row fr-grid-row--gutters fr-py-md-3w">
      <div class="fr-col-12 fr-col-sm-6 fr-col-md-6 fr-col-xl-6">
        <graph-box :dataObj=BoxDataA> </graph-box>
      </div>
      <div class="fr-col-12 fr-col-sm-6 fr-col-md-6 fr-col-xl-6">
        <graph-box :dataObj=BoxDataB> </graph-box>
      </div>
    </div>
    <div class="fr-grid-row fr-grid-row--gutters fr-mb-1w">
      <div class="fr-col-12">
        <graph-box :dataObj=BoxDataC> </graph-box>
      </div>
    </div>
    <div class="fr-grid-row">
      <div class="fr-col-12">
        <up-footer></up-footer>
      </div>
    </div>  
  </div>
</template>

<script>

import axios from 'axios'
import UpFooter from '../components/UpFooter.vue'
import Tags from '../components/Tags.vue'
import GraphBox from '../components/GraphBox.vue'

export default {
  name: 'Secret',
  components: {
    UpFooter,
    Tags,
    GraphBox

  },
  data() {
    return {
      querySuccess: true,

      BoxDataA: {
          title: 'Voyages covoiturés via plateformes',
          update_date: '23/01/2024',
          description: "Description",
          source: "Talkwalker",
          trendValue: -1
      },
      BoxDataB: {
          title: 'Nombre d’infrastructures de covoiturage',
          update_date: '23/01/2024',
          description: "Description",
          source: "Talkwalker",
          trendValue: -1
      },
      BoxDataC: {
          title: 'Taux de remplissage des véhicules',
          update_date: '23/01/2024',
          description: "Description",
          source: "Talkwalker",
          trendValue: -1
      },
    }
  },
  computed: {
  },
  methods: {

  },
  mounted() {
    this.setDimension()
    this.graphics()
  }
}
</script>
  
<style>

.flex-container {
  padding-top: 1.5rem;

  padding-bottom: 2.5rem;
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

/* .fr-tags {
  margin-bottom: 1rem;
} */


</style>
