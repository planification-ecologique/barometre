<template>
  <div>
    <div class="fr-container--fluid">
      <div id="app">
        <StagingBanner />
        <SkipLinksDsfr></SkipLinksDsfr>
        <header-dsfr />
        <main id="content" role="main">
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
import StagingBanner from "./components/StagingBanner.vue";

export default {
  name: "App",
  components: {
    HeaderDsfr,
    FooterDsfr,
    SkipLinksDsfr,
    StagingBanner
  },

  watch: {
    $route(to, from) {
      document.title = to.meta.title || "Baromètre de la planification écologique";
      
      // Add or remove noindex meta tag based on route meta
      this.updateNoIndexMetaTag(to.meta.noindex);
    }
  },
  
  methods: {
    updateNoIndexMetaTag(addNoIndex) {
      // Remove existing noindex meta tag if present
      const existingMeta = document.querySelector('meta[name="robots"]');
      if (existingMeta) {
        existingMeta.remove();
      }
      
      // Add noindex meta tag if this is a staging route
      if (addNoIndex) {
        const noIndexMeta = document.createElement('meta');
        noIndexMeta.setAttribute('name', 'robots');
        noIndexMeta.setAttribute('content', 'noindex, nofollow');
        document.head.appendChild(noIndexMeta);
      }
    }
  },
  
  created() {
    // Set initial noindex status based on initial route
    this.$nextTick(() => {
      this.updateNoIndexMetaTag(this.$route.meta.noindex);
    });
  }
};
</script>

<style>
body {
  padding-top: 0; /* This will be adjusted by JavaScript when the banner is present */
}

/* Add styling for when in staging mode */
body.has-staging-banner {
  padding-top: 80px;
}
</style>
