<template>
  <div>
    <header-dsfr></header-dsfr>

    <div class="fr-container">


      <div id="app">
        <div class="fr-my-5w ">
          <Breadcrumb />
        </div>

        <!-- Bloc de navigation -->
        <!-- <div id="nav">
          <router-link :to="{ name: 'visits' }">Visite</router-link> |
          <router-link :to="{ name: 'sites' }">Sites</router-link>
          <br>
          <br>
          <button @click="$keycloak.logoutFn" v-if="$keycloak.authenticated">Log out</button>
        </div> -->

        <br>
        <SideBar />
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
import UpFooter from './components/UpFooter.vue';

export default {
  name: 'app',
  components: { Breadcrumb, UpFooter, SideBar }
}

</script>
<style>
body {
  background-color: white;
}

</style>
