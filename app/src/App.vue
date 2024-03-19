<template>
  <div>
    <header-dsfr class=".header-position"></header-dsfr>
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
    <footer-dsfr class="footer-position"></footer-dsfr>
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

.header-position {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000; 
}


#app{
  margin-top:11rem;
}


@media (max-width: 767px) {
  #app {
    margin-top: 18rem;
  }
}

</style>
