<template>
  <div class="fr-container">
    <div class="fr-grid-row">
      <div id="sidenav" class="fr-col-12 fr-col-lg-3 fr-hidden fr-unhidden-lg">
        <side-bar v-on:query="refresh"></side-bar>
      </div>      
      <div class="fr-col-12 fr-col-lg-8 fr-col-offset-lg-1">
        <chart-visits :query=myobj v-if="isquery"></chart-visits>
      </div>
    </div>
  </div>
</template>

  <script>
  import SideBar from '../components/SideBar.vue'
  import ChartVisits from '../components/ChartVisits.vue'

  export default {
    name: 'home',
    components: {
        SideBar,
        ChartVisits
    },
    data () {
      return{
        isquery: false,
        myobj: {},
      }
    },
    methods: {
      refresh (query_sidebar) {
        if (query_sidebar != undefined) {
          this.myobj = query_sidebar
          this.isquery = true
        }
      }
    }
  }
  </script>
