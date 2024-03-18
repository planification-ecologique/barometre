<template>
  <div class="cursor_pointer">
    <ul>
        <li
      class="fr-footer__bottom-item"
      v-for="option in menuOptions"
      :key="option.value"
    >
      <a
        class="fr-footer__bottom-link"
        :href="option.link"
        target="_self"
        >{{ option.label }}</a
      >
    </li>

    <li class="fr-footer__bottom-item">
      <a id="fr-link-cookies" class="fr-footer__bottom-link" href="#" onclick="tarteaucitron.userInterface.openPanel();">Gestion des cookies</a>                    
    </li>
    </ul>
  </div>
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
      let base = process.env.VUE_APP_PREFIX_PATH
      this.menuOptions = [
        {
          value: "/donnees-personnelles",
          label: "Données personnelles",
          link: base + "/donnees-personnelles",
          selected: false,
        },
        {
          value: "Accessibilite",
          label: "Accessibilité : non/partiellement/totalement conforme",
          selected: false,
          link: base + "#"
        },
        {
          value: "mentions-legales",
          label: "Mentions légales",
          link: base + "/mentions-legales",
          selected: false,
        },
        {
          value: "plan-du-site",
          label: "Plan du site",
          selected: false,
          link: base + "/plan-du-site"
        },
      ];
    }
  },
  mounted() {
    this.get_menu_options();
  },
};
</script>

<style>
a:hover:not([href]) {
  cursor: pointer;
  /*default;*/
}
.cursor_pointer {
  cursor: pointer;
}
.fr-nav__list {
  padding-left: 20px;
  /* margin-left: 10px; */
}
.breadcrumb {
  margin-left: 17px;
}
</style>
