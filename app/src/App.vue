<template>
  <div>
    <div class="fr-container--fluid">
      <div id="app">
        <SkipLinksDsfr></SkipLinksDsfr>
        <header-dsfr />
        <main id="content">
          <router-view />
        </main>
        <footer-dsfr />
      </div>
    </div>
  </div>
</template>

<script>

import HeaderDsfr from "./components/Header.vue";
import FooterDsfr from "./components/Footer.vue";
import SkipLinksDsfr from "./components/components_dsfr/SkipLinks.vue";

export default {
  name: "App",
  components: {
    HeaderDsfr,
    FooterDsfr,
    SkipLinksDsfr
  },

  watch: {
    $route(to, from) {
      document.title = to.meta.title || "Baromètre de la planification écologique";
    }
  }
};
</script>
