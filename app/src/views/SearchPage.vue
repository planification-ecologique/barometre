<template>
  <div class="fr-container--fluid">
    <div class="fr-grid-row">
      <div class="fr-col">
        <div class="fr-container--fluid fr-container-page">
          <section class="fr-col-md-6 fr-col-lg-6 fr-col-xl-6 fr-col-12">
            <div class="fr-search-bar" id="header-search" role="search">
              <label class="fr-label" for="search-784-input">
                  Recherche
              </label>
              <input 
                v-model="searchQuery" 
                class="fr-input" 
                placeholder="Rechercher un indicateur" 
                type="search" 
                id="search-784-input" 
                name="search-784-input"
                @keyup.enter="handleSearchClick"
              >
              <button class="fr-btn" title="Rechercher" @click="handleSearchClick">
                  Rechercher
              </button>
            </div>
          </section>
          <br/>
          <section>
            <div>
              <Tags @tags-selected="updateTagSelection" :useStaging="useStaging"></Tags>
            </div>
          </section>
          <br/>
          <section>
            <div v-if="results_page.length > 0">
              <h1 class="fr-subtitle">
                {{ this.results_API.length }} indicateurs trouvés
                <span v-if="appliedSearchQuery" class="search-query-display">
                  pour "<strong>{{ appliedSearchQuery }}</strong>"
                </span>
              </h1>
              <section class="fr-col-md-6 fr-col-lg-6 fr-col-xl-6 fr-col-12">
                <div class="fr-select-group">
                  <label class="fr-label" for="theme-levier-select">
                    Sélection du thème
                  </label>
                  <select 
                    class="fr-select" 
                    id="theme-levier-select" 
                    name="theme-levier-select"
                    v-model="selectedValue"
                    @change="onSelectionChange"
                  >
                    <option value="" selected>Sélectionner une option</option>
                    
                    <template v-for="theme in themes">
                      <!-- Theme as option group label -->
                      <option 
                        :value="'theme:' + theme.id_theme"
                        :style="{ fontWeight: 'bold' }"
                      >
                        {{ theme.label_theme }}
                      </option>
                      
                      <!-- Levier options under each theme -->
                      <option 
                        v-for="levier in theme.levier" 
                        :key="theme.id_theme + '-' + levier.id_levier" 
                        :value="theme.id_theme + ':' + levier.id_levier"
                        :style="{ paddingLeft: '20px' }"
                      >
                        — {{ levier.label_levier }}
                      </option>
                    </template>
                  </select>
                </div>
              </section>
              <br/>
              <AdaptiveDashboard
                :dashboardPage="false"
                :inputData="results_page"
                :params="{ label_theme: 'Non disponible' }"
              />
            </div>
            <div v-else-if="results_API.length === 0">
              <p>Aucun indicateur trouvé</p>
            </div>
            <div v-else>
              <p>Chargement des indicateurs...</p>
            </div>
          </section>
        </div>
      </div>
    </div>
    <div
      class="fr-grid-row fr-grid-row--gutters fr-grid-row--center fr-mt-3w fr-mb-1w"
      v-if="isapiloading === false"
    >
      <div>
        <div class="fr-col">
          <Pagination
            :nbPages="nb_pages"
            @selectedPage="handleSelectedPage"
          ></Pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Tags from "../components/Tags.vue";
import AdaptiveDashboard from "../components/AdaptiveDashboard.vue";
import Pagination from "../components/components_dsfr/Pagination.vue";
import { getIndicators, getThemesLevier } from "@/services/csvDataService.js";
import dsfrAnalytics from "../services/dsfr_analytics"

export default {
  name: "SearchPage",
  props: {
    useStaging: {
      type: Boolean,
      default: false
    }
  },
  components: {
    Tags,
    AdaptiveDashboard,
    Pagination,
  },
  // Valeurs initiales
  data() {
    return {
      isapiloading: true,
      searchQuery: '',
      themes: [],
      selectedValue: '',
      results_API: [],
      selectedTags: [],
      results_page: [],
      nb_pages: 0,
      nb_graphs_pages: 6,
      appliedSearchQuery: '',
    };
  },
  methods: {
    updateTagSelection(selectedTag) {
      this.isapiloading = true;
      this.selectedTags = selectedTag;
      // Build query based on selected tags and fetch data
      this.fetchData(selectedTag);
    },
    handleSearchClick() {
      this.isapiloading = true;
      this.fetchData(this.selectedTags);
    },


    handleSelectedPage(page) {
      var start = (page - 1) * this.nb_graphs_pages;
      var end = page * this.nb_graphs_pages;
      this.results_page = this.results_API.slice(start, end);
    },


    async fetchData(ls_tags, theme_levier_filter = []) {
      
      let ls_filters = [
          {
            field: "label_tags",
            values: ls_tags,
          },
          {
            field: "search",
            values: [this.searchQuery.trim()],
          }
        ];

      if (theme_levier_filter.length > 0) {
        var filter_query = ls_filters.concat(theme_levier_filter);
      } else {
        var filter_query = ls_filters;
      }

      var query = {
        filter_by: filter_query,
        time_period: {
          date_start: "2015-01-01",
          date_end: "2031-01-01",
        },
      };

      // Use CSV data service instead of API
      try {
        const results = await getIndicators(query, this.useStaging ? 'staging' : 'production');

        if (!results) {
          throw new Error("Erreur lors de la récupération des données");
        }

        // Set the data
        this.results_API = results.results;
        this.set_pages();
        this.isapiloading = false;
        
        // Update the applied search query only when search is performed
        if (this.searchQuery.trim()) {
          this.appliedSearchQuery = this.searchQuery.trim();
        } else {
          // Clear the applied search query if the search input is empty
          this.appliedSearchQuery = '';
        }
      } catch (error) {
        console.error("Erreur dans le chargement des données : ", error);
      }
    },

    set_pages() {
      this.nb_pages = Math.ceil(this.results_API.length / this.nb_graphs_pages);
    },

    async fetchThemesAndLeviers() {
      this.isLoading = true;
      
      try {
        // Use CSV data service instead of API
        const response = await getThemesLevier(this.useStaging ? 'staging' : 'production');

        if (!response) {
          throw new Error("Erreur lors de la récupération des thèmes et leviers");
        }

        // Retrieve data - note the slightly different structure compared to API
        this.themes = response.data.themes;
        this.isLoading = false;
      } catch (error) {
        console.error("Erreur dans le chargement des thèmes et leviers : ", error);
        this.isLoading = false;
      }
    },
    onSelectionChange() {

      this.isapiloading = true;

      if (!this.selectedValue) return
      
      let theme_levier_filter = [];
      
      // If a theme is selected (no levier), emit only theme
      if (this.selectedValue.startsWith('theme:')) {

        let themeId_query = this.selectedValue.replace('theme:', '')
        theme_levier_filter.push({ field: 'id_theme', values: [themeId_query] });

      } 
      else if (this.selectedValue === '') {
        this.fetchData(this.selectedTags)
      }
      // If a levier is selected, emit both theme and levier
      else {
        let [themeId, levierId] = this.selectedValue.split(':')
        theme_levier_filter.push({ field: 'id_theme', values: [themeId] });
        theme_levier_filter.push({ field: 'id_levier', values: [levierId] });
      }
      this.fetchData(this.selectedTags, theme_levier_filter);
    }
  },
  mounted() {
    this.fetchData(this.selectedTags);
    
    dsfrAnalytics({
      path: "/search",
      name: "search",
      segment: "search",
      labels: ['contenu_liste', 'search', '', '', ''],
      template: "contenu_liste",
      group: "search"
    })  
  },
  created() {
    this.fetchThemesAndLeviers()
  },
};
</script>

<style scoped lang="scss">
.fr-container-page {
  background-color: #f6f6f6;
  padding-top: 1.5rem;
  padding-left: 2.5rem;
  padding-right: 2.5rem;
  width: 100%;
}

.fr-subtitle {
  font-weight: 400;
}

.search-query-display {
  font-size: 1rem;
  color: var(--text-default-grey);
  font-style: italic;
  
  strong {
    color: var(--text-action-high-blue-france);
  }
}
</style>