<template>
  <div>    
    <div class="fr-container--fluid ">
      <main> 
        <div id="app">
          <header-dsfr/>
          <router-view />
          <footer-dsfr/>
        </div>
      </main> 
    </div>
  </div>
</template>

<script>

import ConsentBanner from "./components/ConsentBanner.vue";
import HeaderDsfr from "./components/Header.vue";
import FooterDsfr from "./components/Footer.vue"

export default{
  name:'App',
  components : {
    ConsentBanner,
    HeaderDsfr,
    FooterDsfr
  },

  watch: {
		'$route' (to, from) {
			document.title = to.meta.title || "Baromètre de la planification écologique"
		}
	}
}

</script>
