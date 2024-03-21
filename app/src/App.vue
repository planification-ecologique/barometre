<template>
  <div>
    <header-dsfr></header-dsfr>
    <div class="fr-container--fluid ">
      <main> 
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

  watch: {
		'$route' (to, from) {
			document.title = to.meta.title || "Baromètre de la planification écologique"
		}
	}
}

</script>

<style scoped>

.reset-overflow {
  overflow: visible !important;
}
</style>
