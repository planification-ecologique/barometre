<template>
  <div class="fr-container">
    <div class="fr-grid-row">
      <div id="sidenav" class="fr-col-3">
        <side-bar v-on:query="refresh"></side-bar>
      </div>
      <div class="fr-col-10 fr-col-lg-8 fr-col-offset-lg-1">
        <chart-visits :query=myobj v-if="isquery"></chart-visits>
      </div>
      <!-- <div>
        <up-footer />
      </div> -->
      <div>
        <!-- <Breadcrumb /> -->
      </div>
    </div>
  </div>
</template>

<script>
import SideBar from '../components/SideBar.vue'
import ChartVisits from '../components/ChartVisits.vue'
// import Breadcrumb from '../components/Breadcrumb.vue'
// import UpFooter from '../components/UpFooter.vue'

export default {
  name: 'home',
  components: {
    SideBar,
    ChartVisits,
    UpFooter,
    Breadcrumb
  },
  data() {
    return {
      isquery: false,
      myobj: {},
    }
  },
  methods: {
    refresh(query_sidebar) {
      if (query_sidebar != undefined) {
        this.myobj = query_sidebar
        this.isquery = true
      }
    }
  }
}
</script>
