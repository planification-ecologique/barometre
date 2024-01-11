<template>
  <div>
    <header-dsfr></header-dsfr>
    <div class="fr-my-5w">
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
        <SideNavigation />

        <router-view />

      </div>

    </div>
    <div class="fr-my-5w ">
      <UpFooter />

    </div>

    <footer-dsfr></footer-dsfr>
  </div>
</template>

<script>
import Breadcrumb from './components/Breadcrumb.vue';
import SideBar from './components/SideBar.vue';
import SideNavigation from './components/SideNavigation.vue';
import UpFooter from './components/UpFooter.vue';

export default {
  name: 'app',
  components: { Breadcrumb, UpFooter, SideBar, SideNavigation }
}

</script>
<style>
body {
  background-color: white;
}
</style>
