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
                @search="handleSearchInput"
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
            <div v-if="isapiloading">
              <p>Chargement des indicateurs...</p>
            </div>
            <div v-else-if="results_page.length > 0">
              <h1 class="fr-subtitle">
                {{ this.results_API.length }} indicateurs trouvés
                <span v-if="appliedSearchQuery" class="search-query-display">
                  pour "<strong>{{ appliedSearchQuery }}</strong>"
                </span>
              </h1>
              <section class="fr-col-md-6 fr-col-lg-6 fr-col-xl-6 fr-col-12">
                <div class="fr-select-group">
                  <label class="fr-label" for="sector-select">
                    Sélection du secteur
                  </label>
                  <select 
                    class="fr-select" 
                    id="sector-select" 
                    name="sector-select"
                    v-model="selectedValue"
                    @change="onSelectionChange"
                  >
                    <option value="" selected>Sélectionner une option</option>
                    <option
                      v-for="sector in sectors"
                      :key="sector"
                      :value="sector"
                    >
                      {{ sector }}
                    </option>
                  </select>
                </div>
              </section>
              <br/>
              <AdaptiveDashboard
                :dashboardPage="false"
                :inputData="results_page"
                :params="{ sector: selectedValue || 'Non disponible', label_theme: 'Non disponible' }"
              />
            </div>
            <div v-else>
              <p>Aucun indicateur trouvé</p>
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
import { getIndicators, getNavigationStructure } from "@/services/csvDataService.js";
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
      sectors: [],
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
    handleSearchInput(event) {
      // The search event fires when the clear button (X) is clicked
      // or when pressing Enter with an empty search field
      if (this.searchQuery === '') {
        this.isapiloading = true;
        this.fetchData(this.selectedTags);
      }
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
    async fetchSectors() {
      try {
        const response = await getNavigationStructure(this.useStaging ? 'staging' : 'production');

        if (!response || response.status !== 'success') {
          throw new Error("Erreur lors de la récupération des secteurs");
        }

        this.sectors = response.data.sectorNames || [];
      } catch (error) {
        console.error("Erreur dans le chargement des secteurs : ", error);
      }
    },
    onSelectionChange() {
      this.isapiloading = true;

      if (!this.selectedValue) {
        this.fetchData(this.selectedTags);
        return;
      }
      
      const sectorFilter = [{ field: 'sector', values: [this.selectedValue] }];
      this.fetchData(this.selectedTags, sectorFilter);
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
    this.fetchSectors();
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