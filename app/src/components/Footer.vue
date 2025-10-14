<template>
  <footer class="fr-footer" role="contentinfo" id="footer">
    <div class="fr-container--fluid fr-ml-2w">
      <div class="fr-footer__body custom-footer-body">
        <div class="custom-footer-body-logos">
          <div class="fr-footer__brand">
              <p class="fr-logo">Premier<br/>Ministre</p>
          </div>
          <div class="fr-footer__brand">
            <p class="fr-logo">Ministères<br/>Aménagement<br/>du territoire<br/>transition<br/>écologique</p>
          </div>
          <div class="fr-footer__brand">
            <img id="ecolab-logo" src="../images/ecolab-logo.webp" alt="Logo de l'ecolab" title="logo ecolab"/>
          </div>
        </div>
        <div class="fr-footer__content custom-footer-content">
          <p class="fr-footer__content-desc">
            Ce site est géré par le Secrétariat Général de la Planification Ecologique (SGPE) et le Commissariat Général au Développement Durable (CGDD)
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
            <a v-if="!cookiesBlocked" id="fr-footer-link-cookies" class="fr-footer__bottom-link" href="#"
              onclick="tarteaucitron.userInterface.openPanel();" title="Gestion des cookies">
              Gestion des cookies
            </a>
            <a v-else id="fr-blocked-cookies" class="fr-footer__bottom-link"
               title="Cookies bloqués">
              Cookies bloqués
            </a>
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
      cookiesBlocked : false,
      menuOptions: [
        {
          label: "À propos",
          router_name: "a-propos",
        },
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
        },
        {
          link: "https://ecologie.data.gouv.fr",
          label: "ecologie.data.gouv.fr ",
          value: "ecologie-data-gouv"
        }
      ]
    }
  },
  methods:{
    blocked_cookies(){
      try {
        localStorage.getItem("tarteaucitron");
        this.cookiesBlocked = false;
      } catch (err) {
        this.cookiesBlocked = true;
      }
    }
  },
  mounted(){
    this.blocked_cookies()
  }
}
</script>
