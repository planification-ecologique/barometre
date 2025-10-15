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
import StagingBanner from "./components/StagingBanner.vue";
import SkipLinksDsfr from "./components/components_dsfr/SkipLinks.vue";

export default {
  name: "App",
  components: {
    HeaderDsfr,
    FooterDsfr,
    StagingBanner,
    SkipLinksDsfr
  },
  watch: {
    $route(to) {
      this.updateNoIndexMetaTag(to.meta.noindex);
    }
  },
  methods: {
    updateNoIndexMetaTag(noindex) {
      const metaTag = document.querySelector('meta[name="robots"]');
      if (noindex) {
        if (!metaTag) {
          const meta = document.createElement('meta');
          meta.name = 'robots';
          meta.content = 'noindex';
          document.head.appendChild(meta);
        }
      } else if (metaTag) {
        metaTag.remove();
      }
    }
  },
  mounted() {
    this.updateNoIndexMetaTag(this.$route.meta.noindex);
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

/* Hide header/footer via body classes to avoid remount flicker */
body.hide-header header[role="banner"] { display: none; }
body.hide-footer footer[role="contentinfo"] { display: none; }

</style>
