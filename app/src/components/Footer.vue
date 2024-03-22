<template>
  <footer class="fr-footer" role="contentinfo" id="footer">
    <div class="footer-container">
      <div class="fr-footer__body">
        <div class="fr-footer__brand fr-enlarge-link">
          <a
            href="https://www.gouvernement.fr/"
            target="_blank"
            id="logo-footer-href"
            title="Retour à l’accueil du site - Nom de l’entité (ministère, secrétariat d‘état, gouvernement)"
          >
            <p class="fr-logo">GOUVERNEMENT</p>
          </a>
        </div>
        <div class="fr-footer__content">
          <p class="fr-footer__content-desc">
            Ce site est géré par le Secrétariat Général de la Planification
            Ecologique (SGPE).
          </p>
          <ul class="fr-footer__content-list">
            <li class="fr-footer__content-item">
              <a
                class="fr-footer__content-link"
                id="link-legifrance"
                target="_blank"
                rel="noopener external"
                title="legifrance.gouv.fr"
                href="https://legifrance.gouv.fr"
                >legifrance.gouv.fr</a
              >
            </li>
            <li class="fr-footer__content-item">
              <a
                class="fr-footer__content-link"
                id="link-gouvernemment"
                target="_blank"
                rel="noopener external"
                title="gouvernement.fr"
                href="https://gouvernement.fr"
                >gouvernement.fr</a
              >
            </li>
            <li class="fr-footer__content-item">
              <a
                class="fr-footer__content-link"
                id="link-service-public"
                target="_blank"
                rel="noopener external"
                title="service-public.fr"
                href="https://service-public.fr"
                >service-public.fr</a
              >
            </li>
            <li class="fr-footer__content-item">
              <a
                class="fr-footer__content-link"
                id="link-data-gouv"
                target="_blank"
                rel="noopener external"
                title="data.gouv.fr"
                href="https://data.gouv.fr"
                >data.gouv.fr</a
              >
            </li>
          </ul>
        </div>
      </div>
      <navigation-footer></navigation-footer>
      <div class="fr-footer__bottom-copy">
        <p>
          Sauf mention explicite de propriété intellectuelle détenue par des
          tiers, les contenus de ce site sont proposés sous
          <a
            href="https://github.com/etalab/licence-ouverte/blob/master/LO.md"
            id="link-license"
            target="_blank"
            rel="noopener external"
            title="licence etalab-2.0"
            >licence etalab-2.0</a
          >
        </p>
      </div>
    </div>
  </footer>
</template>

<script>
import NavigationFooter from "./NavigationFooter.vue";

export default {
  name: "FooterDsfr",
  components: {
    NavigationFooter,
  },
  data() {
    return {};
  },
  computed: {},
  methods: {},
  mounted() {},
};
</script>
<style>
.footer-container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}
</style>
