<template>
  <div>
    <div class="fr-container--fluid">
      <div id="app">
        <header-dsfr />
        <main>
          <router-view />
        </main>
        <footer-dsfr />
      </div>
    </div>
  </div>
</template>

<script>
import ConsentBanner from "./components/ConsentBanner.vue";
import HeaderDsfr from "./components/Header.vue";
import FooterDsfr from "./components/Footer.vue";

export default {
  name: "App",
  components: {
    ConsentBanner,
    HeaderDsfr,
    FooterDsfr,
  },

  watch: {
    $route(to, from) {
      document.title =
        to.meta.title || "Baromètre de la planification écologique";
    },
  },
};
</script>
