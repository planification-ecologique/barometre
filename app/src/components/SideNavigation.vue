<template>
  <nav role="navigation" class="fr-sidemenu fr-sidemenu__padding"
    aria-label="Navigation des volets">
    <div class="fr-sidemenu__inner">
      <button class="fr-sidemenu__btn" aria-controls="fr-sidemenu-wrapper" aria-expanded="false">
        Filtre sur les indicateurs
      </button>
      <div class="fr-collapse" id="fr-sidemenu-wrapper">
        <ul class="fr-sidemenu__list">
          <li class="fr-sidemenu__item" v-for="(theme, index) in menuOptions" :key="index">
            <button class="fr-sidemenu__btn"
              :title="theme.label_theme"
              aria-expanded="false"
              :aria-controls="'fr-sidemenu-item-' + theme.id_theme"
              :aria-current="theme.selected"
              @click="expanded_theme(theme.id_theme)"
            >
              {{ theme.label_theme }}
            </button>
            <div class="fr-collapse" :id="'fr-sidemenu-item-' + theme.id_theme">
              <ul class="fr-sidemenu__list">
                <li class="fr-sidemenu__item" v-for="(levier, index) in theme.leviers" :key="index">
                  <a class="fr-sidemenu__link" 
                    :title="levier.label_levier"
                    @click="set_query(theme.label_theme, theme.id_theme, levier)"
                    target="_self"
                    :id="'fr-sidemenu__link-' + theme.id_theme + levier.id_levier"
                    :aria-current="levier.selected"
                    aria-expanded="false"
                    tabindex="0"
                    v-on:keyup.enter="set_query(theme.label_theme, theme.id_theme, levier)"
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

import { getThemesLevier } from "@/services/csvDataService.js";

export default {
  name: "SideNavigation",
  data() {
    return {
      menuOptions: [],
      expanded: true,
      pre_selected_theme: undefined,
      pre_selected_levier: undefined,
    };
  },
  props: {
    initParams: {
      type: Object,
    },
    useStaging: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    async fetch_menu_options() {
      try {
        // Get themes and leviers from CSV data service
        const response = await getThemesLevier(this.useStaging ? 'staging' : 'production');
        if (!response || !response.data || !response.data.themes) {
          throw new Error(
            "Erreur lors de la récupération des thèmes et leviers"
          );
        }

        let result = response.data.themes;
        
        // Filter out themes with no leviers to avoid errors
        result = result.filter(theme => theme.leviers && theme.leviers.length > 0);
        
        // If no valid themes, show error and return
        if (!result.length) {
          console.error("No valid themes with leviers found");
          return;
        }
        
        this.menuOptions = result;

        // Default values - always initialize with first theme/levier
        let defaultTheme = this.menuOptions[0];
        let defaultLevier = defaultTheme.leviers[0];

        // Check if specific theme/levier are requested
        if (this.initParams && this.initParams.id_theme && this.initParams.id_theme !== "default") {
          // Try to find the requested theme
          const requestedTheme = this.menuOptions.find(theme => theme.id_theme === this.initParams.id_theme);
          
          if (requestedTheme) {
            defaultTheme = requestedTheme;
            
            // If a specific levier is requested
            if (this.initParams.id_levier) {
              const requestedLevier = requestedTheme.leviers.find(
                levier => levier.id_levier === this.initParams.id_levier
              );
              
              if (requestedLevier) {
                defaultLevier = requestedLevier;
              }
            }
          }
        }
        
        // Set the theme and levier (either default or requested)
        this.initParams = this.initParams || {};
        this.initParams.label_theme = defaultTheme.label_theme;
        this.initParams.id_theme = defaultTheme.id_theme;
        this.initParams.levier = defaultLevier;
        
        // Initialize the dashboard
        this.set_query(
          this.initParams.label_theme,
          this.initParams.id_theme,
          this.initParams.levier
        );
        this.expanded_theme(this.initParams.id_theme);
      } catch (error) {
        console.error("Erreur dans le chargement de la navigation : ", error);
      }
    },
    set_query(label_theme, id_theme, levier) {
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
      this.set_selected_theme(id_theme, levier.id_levier);
      this.$emit("params", params);
    },
    set_selected_theme(selected_id_theme, selected_id_levier) {
      // clean preselected values
      if (this.pre_selected_theme != undefined) {
        this.set_state_selected(
          this.pre_selected_theme,
          this.pre_selected_levier,
          false
        );
      }
      this.pre_selected_theme = selected_id_theme;
      this.pre_selected_levier = selected_id_levier;

      this.set_state_selected(selected_id_theme, selected_id_levier, true);
    },
    set_state_selected(theme, levier, state) {
      var selected_element = this.menuOptions.filter(
        (element) => element.id_theme === theme
      )[0];
      selected_element.selected = state;
      selected_element.leviers.filter(
        (element) => element.id_levier === levier
      )[0].selected = state;
    },
    expanded_theme(selected_id_theme) {
      this.menuOptions.forEach(function (element) {
        element.expanded = false;
      });
      var selected_element = this.menuOptions.filter(
        (element) => element.id_theme === selected_id_theme
      )[0];
      selected_element.expanded = true;
    },
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
