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
                ref="searchInput"
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
            <div class="search-filters">
              <SearchTaxonomyFilters
                @taxonomy-selected="updateTaxonomySelection"
                :useStaging="useStaging"
                :initialSectors="initialSectorsFromQuery"
                :initialAxes="initialAxesFromQuery"
              />
              <button
                type="button"
                class="fr-tag regional-filter-btn"
                :class="{ 'regional-filter-btn--active': filterRegionalOnly }"
                :aria-pressed="filterRegionalOnly"
                :title="filterRegionalOnly ? 'Afficher tous les indicateurs' : 'Filtrer les indicateurs avec données régionales'"
                @click="toggleRegionalFilter"
              >
                <span class="ri-hexagon-line regional-filter-icon" aria-hidden="true"></span>
                Données régionales
              </button>
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
              <AdaptiveDashboard
                :dashboardPage="false"
                :inputData="results_page"
                :params="{ sector: 'Recherche', label_theme: 'Non disponible' }"
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
import SearchTaxonomyFilters from "../components/SearchTaxonomyFilters.vue";
import AdaptiveDashboard from "../components/AdaptiveDashboard.vue";
import Pagination from "../components/components_dsfr/Pagination.vue";
import { getIndicators } from "@/services/csvDataService.js";
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
    SearchTaxonomyFilters,
    AdaptiveDashboard,
    Pagination,
  },
  // Valeurs initiales
  data() {
    return {
      isapiloading: true,
      searchQuery: '',
      selectedSectors: [],
      selectedAxes: [],
      results_API: [],
      results_page: [],
      nb_pages: 0,
      nb_graphs_pages: 6,
      appliedSearchQuery: '',
      filterRegionalOnly: false,
    };
  },
  computed: {
    initialSectorsFromQuery() {
      const q = this.$route?.query?.sector;
      if (!q) return [];
      return Array.isArray(q) ? q : [q];
    },
    initialAxesFromQuery() {
      const q = this.$route?.query?.axe;
      if (!q) return [];
      return Array.isArray(q) ? q : [q];
    },
  },
  methods: {
    toggleRegionalFilter() {
      this.filterRegionalOnly = !this.filterRegionalOnly;
      this.isapiloading = true;
      this.fetchData();
    },
    updateTaxonomySelection({ sectors, axes }) {
      this.isapiloading = true;
      this.selectedSectors = sectors;
      this.selectedAxes = axes;
      this.fetchData();
    },
    handleSearchClick() {
      this.isapiloading = true;
      this.fetchData();
    },
    handleSearchInput(event) {
      // The search event fires when the clear button (X) is clicked
      // or when pressing Enter with an empty search field
      if (this.searchQuery === '') {
        this.isapiloading = true;
        this.fetchData();
      }
    },
    handleSelectedPage(page) {
      var start = (page - 1) * this.nb_graphs_pages;
      var end = page * this.nb_graphs_pages;
      this.results_page = this.results_API.slice(start, end);
    },
    async fetchData() {
      const ls_filters = [
        { field: "search", values: [this.searchQuery.trim()] }
      ];

      if (this.selectedSectors.length > 0) {
        ls_filters.push({ field: "sector", values: this.selectedSectors });
      }
      if (this.selectedAxes.length > 0) {
        ls_filters.push({ field: "chantier_ou_impact", values: this.selectedAxes });
      }
      if (this.filterRegionalOnly) {
        ls_filters.push({ field: "has_regional_data", values: [true] });
      }

      const filter_query = ls_filters;

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
  },
  mounted() {
    const q = this.$route.query.q;
    if (q) {
      this.searchQuery = q;
    }
    const sectors = this.initialSectorsFromQuery;
    const axes = this.initialAxesFromQuery;
    if (sectors.length > 0 || axes.length > 0) {
      this.selectedSectors = sectors;
      this.selectedAxes = axes;
    }
    this.fetchData();
    this.$nextTick(() => {
      this.$refs.searchInput?.focus();
    });
    
    dsfrAnalytics({
      path: "/recherche",
      name: "recherche",
      segment: "search",
      labels: ['contenu_liste', 'search', '', '', ''],
      template: "contenu_liste",
      group: "search"
    })  
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

.search-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.regional-filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  background-color: #fef7e6;
  color: #161616;
  transition: background-color 0.15s, color 0.15s;

  &:hover {
    background-color: #f5e6c8;
  }
}

.regional-filter-icon {
  font-size: 1rem;
}

.regional-filter-btn--active {
  background-color: #c4790a;
  color: #fff;
}
</style>