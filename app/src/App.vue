<template>
  <div class="main">
    <div class="fr-my-5w ">
      <header-dsfr></header-dsfr>
      <Breadcrumb />
    </div>
    <div class="fr-container">
      <div id="app">
        <!-- Bloc de navigation -->
        <!-- <div id="nav">
          <router-link :to="{ name: 'visits' }">Visite</router-link> |
          <router-link :to="{ name: 'sites' }">Sites</router-link>
          <br>
          <br>
          <button @click="$keycloak.logoutFn" v-if="$keycloak.authenticated">Log out</button>
        </div> -->
        <br>
        <!-- <SideBar /> -->
        <div >
          <SideNavigation />
      <FurtherIndicators />
        </div>
       

        <router-view />
      </div>
    </div>

    <div class="fr-my-5w ">
      <UpFooter />
      <footer-dsfr></footer-dsfr>
    </div>
  </div>
</template>

<script>
import Breadcrumb from './components/Breadcrumb.vue';
import SideBar from './components/SideBar.vue';
import SideNavigation from './components/SideNavigation.vue';
import UpFooter from './components/UpFooter.vue';
import FurtherIndicators from './components/FurtherIndicators.vue';

export default {
  name: 'app',
  components: { Breadcrumb, UpFooter, SideBar, SideNavigation, FurtherIndicators }
}

</script>
<style>
.main {
  background-color: #F3EDE5;

}

body {
  background-color: #F3EDE5;

}

.fr-my-5w {
  background-color: white;

}
</style>
