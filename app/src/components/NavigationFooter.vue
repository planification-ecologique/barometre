<template>
  <ul class="fr-footer__bottom-list">
    <li class="fr-footer__bottom-item" v-for="option in menuOptions">
      <a
        class="fr-footer__bottom-link"
        :href="option.link"
        target="_self"
        :title="option.label"
        :id="option.id"
        >{{ option.label }}</a
      >
    </li>
    <li class="fr-footer__bottom-item">
      <a
        id="fr-link-cookies"
        class="fr-footer__bottom-link"
        href="#"
        onclick="tarteaucitron.userInterface.openPanel();"
        title="Gestion des cookies"
        >Gestion des cookies</a
      >
    </li>
  </ul>
</template>

<script>
export default {
  name: "navigation-dsfr",
  data() {
    return {
      menuOptions: [],
    };
  },
  methods: {
    get_menu_options() {
      let base = process.env.VUE_APP_PREFIX_PATH;
      this.menuOptions = [
        {
          label: "Données personnelles",
          link: base + "/donnees-personnelles",
          id:"footer-donnees-personnelles"
        },
        {
          label: "Accessibilité : non/partiellement/totalement conforme",
          link: base + "#",
          id:"footer-accessibilite"
        },
        {
          label: "Mentions légales",
          link: base + "/mentions-legales",
          id: "footer-mentions-legales"
        },
        {
          label: "Plan du site",
          link: base + "/plan-du-site",
          id: "footer-plan-du-site"
        },
      ];
    },
  },
  mounted() {
    this.get_menu_options();
  },
};
</script>
