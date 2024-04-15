<template>
  <footer class="fr-footer" role="contentinfo" id="footer">
    <div class="fr-container--fluid fr-ml-2w">
      <div class="fr-footer__body">
        <div class="fr-footer__brand fr-enlarge-link">
          <a href="https://www.info.gouv.fr/" target="_blank" id="fr-footer-logo-footer-href"
            title="info.gouv.fr - nouvelle fenêtre">
            <p class="fr-logo">GOUVERNEMENT</p>
          </a>
        </div>
        <div class="fr-footer__content">
          <p class="fr-footer__content-desc">
            Ce site est géré par le Secrétariat Général de la Planification
            Ecologique (SGPE).
          </p>
          <ul class="fr-footer__content-list">
            <li class="fr-footer__content-item" v-for="option in menuLinks">
              <a class="fr-footer__content-link" :id="'fr-footer-link-' + option.value" target="_blank"
                rel="noopener external" :title="option.label + ' - nouvelle fenêtre'" :href=option.link>{{ option.label
                }}</a>
            </li>
          </ul>
        </div>
      </div>
      <div class="fr-footer__bottom">
        <ul class="fr-footer__bottom-list">
          <li class="fr-footer__bottom-item" v-for="option in menuOptions">
            <router-link class="fr-footer__bottom-link" target="_self" :id="'fr-footer-link-' + option.router_name"
              :to="{ name: option.router_name }" :title=option.label> {{ option.label }}
            </router-link>
          </li>

          <li class="fr-footer__bottom-item">
            <a id="fr-footer-link-cookies" class="fr-footer__bottom-link" href="#"
              onclick="tarteaucitron.userInterface.openPanel();" title="Gestion des cookies">Gestion des cookies</a>
          </li>
        </ul>
        <div class="fr-footer__bottom-copy">
          <p>
            Sauf mention explicite de propriété intellectuelle détenue par des
            tiers, les contenus de ce site sont proposés sous
            <a href="https://github.com/etalab/licence-ouverte/blob/master/LO.md" id="link-license" target="_blank"
              rel="noopener external" title="licence etalab-2.0 - nouvelle fenêtre">licence etalab-2.0</a>
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: "FooterDsfr",
  data() {
    return {
      menuOptions: [
        {
          label: "Plan du site",
          router_name: "plan-du-site",
        },
        {
          label: "Accessibilité : totalement conforme",
          router_name: "accessibilite"
        },
        {
          label: "Mentions légales",
          router_name: "mentions-legales"
        },
        {
          label: "Données personnelles",
          router_name: "donnees-personnelles"
        }
      ],
      menuLinks: [
        {
          link: "https://legifrance.gouv.fr",
          label: "legifrance.gouv.fr",
          value: "legifrance"
        },
        {
          link: "https://www.info.gouv.fr/",
          label: "info.gouv.fr",
          value: "info-gouvernemment"
        },
        {
          link: "https://service-public.fr",
          label: "service-public.fr",
          value: "service-public"
        },
        {
          link: "https://data.gouv.fr",
          label: "data.gouv.fr",
          value: "data-gouv"
        }
      ]
    }
  }
}
</script>
