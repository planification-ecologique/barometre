<template>
  <div>
    <header-dsfr></header-dsfr>
    <div class="fr-container">

      <div id="app">
        <Breadcrumb />
        <!-- Bloc de navigation -->
        <!-- <div id="nav">
          <router-link :to="{ name: 'visits' }">Visite</router-link> |
          <router-link :to="{ name: 'sites' }">Sites</router-link>
          <br>
          <br>
          <button @click="$keycloak.logoutFn" v-if="$keycloak.authenticated">Log out</button>
        </div> -->
        <br>
        <router-view />
      </div>

    </div>
    <footer-dsfr></footer-dsfr>
  </div>
</template>

<script>
import Breadcrumb from './components/Breadcrumb.vue';

export default {
    name: 'app',
    components: { Breadcrumb }
}

</script>
<style>
body {
  background-color: white;
}
</style>
