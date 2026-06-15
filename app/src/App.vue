<template>
  <div>
    <div class="fr-container--fluid app-root-container">
      <div id="app">
        <StagingBanner />
        <SkipLinksDsfr></SkipLinksDsfr>
        <header-dsfr />
        <main id="content" role="main">
          <router-view />
        </main>
        <footer-dsfr />
        <chart-color-test-modal />
        <button
          v-if="showGlobalFeedback"
          type="button"
          class="fr-btn fr-btn--secondary fr-btn--sm feedback-fab"
          title="Signaler un problème"
          @click="openFeedback"
        >
          Signaler un problème
        </button>
        <feedback-form-modal
          :visible="feedbackOpen"
          :page-url="feedbackPageUrl"
          @close="feedbackOpen = false"
        />
      </div>
    </div>
  </div>
</template>

<script>
import HeaderDsfr from "./components/Header.vue";
import FooterDsfr from "./components/Footer.vue";
import StagingBanner from "./components/StagingBanner.vue";
import SkipLinksDsfr from "./components/components_dsfr/SkipLinks.vue";
import ChartColorTestModal from "./components/ChartColorTestModal.vue";
import FeedbackFormModal from "./components/FeedbackFormModal.vue";

export default {
  name: "App",
  components: {
    HeaderDsfr,
    FooterDsfr,
    StagingBanner,
    SkipLinksDsfr,
    ChartColorTestModal,
    FeedbackFormModal,
  },
  data() {
    return {
      feedbackOpen: false,
      feedbackPageUrl: '',
    };
  },
  computed: {
    showGlobalFeedback() {
      return !this.$route.meta.hideFooter;
    },
  },
  watch: {
    $route(to) {
      this.updateNoIndexMetaTag(to.meta.noindex);
    }
  },
  methods: {
    openFeedback() {
      this.feedbackPageUrl = window.location.href;
      this.feedbackOpen = true;
    },
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
/* Override DSFR's overflow: hidden so the sticky desktop nav can stick to the viewport */
.app-root-container {
  overflow: visible;
}

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

.feedback-fab.fr-btn {
  position: fixed;
  left: 1rem;
  bottom: 1rem;
  z-index: 1000;
  background-color: #fff !important;
  --background-default-grey: #fff;
  --background-contrast-grey: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.16);
}

.feedback-fab.fr-btn:not(:disabled):hover,
.feedback-fab.fr-btn:not(:disabled):active {
  background-color: #fff !important;
}

</style>
