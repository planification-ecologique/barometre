<template>
  <nav
    role="navigation"
    class="fr-sidemenu"
    aria-labelledby="fr-sidemenu-title"
  >
    <div class="fr-sidemenu__inner btn-menu fr-col">
      <button
        class="fr-sidemenu__btn "
        aria-controls="fr-sidemenu-wrapper"
        aria-expanded="true"
      >
        Filtre sur les indicateurs
      </button>
      <div class="fr-collapse" id="fr-sidemenu-wrapper">
        <ul class="fr-sidemenu__list">
          <li
            class="fr-sidemenu__item"
            v-for="(theme, index) in menuOptions"
            :key="index"
            :aria-current="isActive(index) ? 'page' : null"
            @click="closeSubmenu(index)"
          >
            <button
              class="fr-sidemenu__btn"
              aria-expanded="false"
              :aria-controls="'fr-sidemenu-item-' + theme.id_theme"
              :aria-current="isActive(index) ? 'page' : null" @click="activeTabIndex = index"
            >
              {{ theme.label_theme }}
            </button>
            <div class="fr-collapse" :id="'fr-sidemenu-item-' + theme.id_theme">
              <ul class="fr-sidemenu__list">
                <li
                  class="fr-sidemenu__item"
                  v-for="(levier, index) in theme.levier"
                  :key="index"
                >
                  <a
                    class="fr-sidemenu__link"
                    @click="
                      set_query(theme.label_theme, theme.id_theme, levier)
                    "
                    target="_self"
                  >
                    {{ levier.label_levier }}
                  </a>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { api } from "@/services/api.js";

export default {
  name: "SideNavigation",
  data() {
    return {
      menuOptions: [],
      activeTabIndex: 0,
      selectedSubmenuIndex: null
    };
  },
  methods: {
    async fetch_menu_options() {
      try {
        const response = await api("/requests/get_themes_levier", {
          method: "GET",
        });
        if (!response) {
          throw new Error(
            "Erreur lors de la récupération des thèmes et leviers"
          );
        }

        let result = response.data.results;
        this.menuOptions = result;
        this.set_query(
          this.menuOptions[0].label_theme,
          this.menuOptions[0].id_theme,
          this.menuOptions[0].levier[0]
        );
      } catch (error) {
        console.error("Erreur dans le chargement de la navigation : ", error);
      }
    },
 selectTab(index) {
  this.activeTabIndex = index;
  this.selectedSubmenuIndex = null; // Réinitialise le sous-menu sélectionné
},
    isActive(index) {
      return this.activeTabIndex === index;
    },
    set_query(label_theme, id_theme, levier) {
      // console.log(JSON.stringify(levier))
      var params = {
        label_theme: label_theme,
        label_levier: levier.label_levier,
        query: {
          filter_by: [
            { field: "id_theme", values: [id_theme] },
            { field: "id_levier", values: [levier.id_levier] },
          ],
          time_period: {
            date_start: "2015-01-01",
            date_end: "2031-01-01",
          },
        },
      };
      this.$emit("params", params);
    },
      closeSubmenu(index) {
      if (this.selectedSubmenuIndex !== null && this.selectedSubmenuIndex !== index) {
        this.selectedSubmenuIndex = null;
      }
    }
  },
  mounted() {
    this.fetch_menu_options();
  },
};
</script>

<style scoped>
a:hover:not([href]) {
  cursor: pointer;
  background-color: #f6f6f6;
}


</style>
