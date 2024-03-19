<template>
  <div>
    <header-dsfr class="header-position"></header-dsfr>
    <div class="fr-container--fluid " style="margin-top: 6rem;">
      <main class="main-content"> 
        <div id="app">
          <!-- Bloc de navigation -->
          <!-- <div id="nav">
            <router-link :to="{ name: 'visits' }">Visite</router-link> |
            <router-link :to="{ name: 'sites' }">Sites</router-link>
            <br>
            <br>
            <button @click="$keycloak.logoutFn" v-if="$keycloak.authenticated">Log out</button>
          </div> -->
          <!-- <consent-banner></consent-banner> -->
          <router-view />
        </div>
      </main> 

    </div>

    <!-- <upfooter></upfooter> -->
    <footer-dsfr></footer-dsfr>
  </div>
    <!-- <upfooter></upfooter> -->
</template>

<script>

import ConsentBanner from "./components/ConsentBanner.vue";
export default{
  name:'App',
  components : {
    ConsentBanner
  },
  data (){
    return {

    }
  }
}

</script>

<style scoped>

.header-position {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000; 
}

.main-content {
  margin-top: 6rem; /* Ajustez la marge supérieure pour compenser la hauteur du header */
}

.reset-overflow {
  overflow: visible !important;
}

</style>
