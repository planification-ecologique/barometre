<template>
  <div class="cursor_pointer">
    <li
      class="fr-footer__bottom-item"
      v-for="option in menuOptions"
      :key="option.value"
    >
      <a
        class="fr-footer__bottom-link"
        @click="router_to_pages(option)"
        target="_self"
        :aria-current="option.selected"
        style="color: rgb(59, 58, 58)"
        >{{ option.label }}</a
      >
    </li>

    <li class="fr-footer__bottom-item">
      <a id="fr-link-cookies" class="fr-footer__bottom-link" href="#" onclick="tarteaucitron.userInterface.openPanel();">Gestion des cookies</a>                    
    </li>

  </div>
</template>

<script>
import router from "../router";
export default {
  name: "navigation-dsfr",
  data() {
    return {
      myrouter: router,
      menuOptions: [],
    };
  },
  methods: {
    get_menu_options() {
      this.menuOptions = [
        {
          value: "donnees-personnelles",
          label: "Données personnelles",
          selected: false,
        },
        {
          value: "mentions-legales",
          label: "Mentions légales",
          selected: false,
        },
        // {
        //   value: "gestion-des-cookies",
        //   label: "Gestion des cookies",
        //   selected: false,
        // },
          {
          value: "Accessibilite",
          label: "Accessibilité : non/partiellement/totalement conforme",
          selected: false,
        },
        {
          value: "plan-du-site",
          label: "Plan du site",
          selected: false,
        },
      ];
      var current_page = this.get_name_page();
      if (current_page == "") {
        current_page = "accueil";
      }
      this.set_selected_page(current_page);
    },
    router_to_pages(option) {
      var name_page = this.get_name_page();
      if (option.value != name_page) {
        this.myrouter.push({ name: option.value });
        this.set_selected_page(option.value);
      }
    },
    set_selected_page(page_name) {
      this.menuOptions.forEach(function (element) {
        element.selected = false;
      });

      const selectedOption = this.menuOptions.find(
        (option) => option.value === page_name
      );
      if (selectedOption) {
        selectedOption.selected = true;
      }
    },
    get_name_page() {
      let location = window.location.href;
      var page = location.split("/");
      page = page[page.length - 1];
      page = page.split("#")[0];
      return page;
    },
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
