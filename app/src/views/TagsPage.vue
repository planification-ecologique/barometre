<template>
  <div class="fr-container--fluid">
    <div class="fr-grid-row">
      <div class="fr-col">
        <div class="fr-container--fluid fr-container-page">
          <section>
            <div>
              <Tags @tags-selected="updateSelection"></Tags>
            </div>
          </section>

          <br />
          <section>
            <div v-if="results_page.length > 0">
              <h1 class="fr-subtitle">
                {{ this.results_API.length }} indicateurs trouvés
              </h1>
              <AdaptiveDashboard
                :dashboardPage="false"
                :inputData="results_page"
                :params="{ label_theme: 'Non disponible' }"
              />
            </div>

            <div v-else>
              <p>Chargement des indicateurs...</p>
            </div>
          </section>
        </div>
      </div>
    </div>
    <div
      class="fr-grid-row fr-grid-row--gutters fr-grid-row--center"
      v-if="isapiloading === false"
    >
      <div class="fr-col-8">
        <Pagination
          :nbPages="nb_pages"
          @selectedPage="handleSelectedPage"
        ></Pagination>
      </div>
    </div>
  </div>
</template>

<script>
import Tags from "../components/Tags.vue";
import AdaptiveDashboard from "../components/AdaptiveDashboard.vue";
import Pagination from "../components/components_dsfr/Pagination.vue";
import { api } from "@/services/api.js";

export default {
  name: "TagsPage",
  components: {
    Tags,
    AdaptiveDashboard,
    Pagination,
  },
  data() {
    return {
      isapiloading: true,
      results_API: [],
      selectedTags: ["atténuation"],
      results_page: [],
      nb_pages: 0,
      nb_graphs_pages: 6,
    };
  },
  methods: {
    updateSelection(selectedTag) {
      this.isapiloading = true;
      // Build query based on selected tags and fetch data
      this.fetchData(selectedTag);
    },
    handleSelectedPage(page) {
      var start = (page - 1) * this.nb_graphs_pages;
      var end = page * this.nb_graphs_pages;
      this.results_page = this.results_API.slice(start, end);
    },
    async fetchData(ls_tags) {
      var query = {
        filter_by: [
          {
            field: "label_tags",
            values: ls_tags,
          },
        ],
        time_period: {
          date_start: "2015-01-01",
          date_end: "2031-01-01",
        },
      };
      // Call API
      try {
        const response = await api("/requests/get_indicators", {
          method: "POST",
          body: JSON.stringify(query),
        });

        if (!response) {
          throw new Error("Erreur lors de l'appel à l'API");
        }

        // Retrieve data
        let results = response;
        this.results_API = results.data.results;
        this.set_pages();
        this.isapiloading = false;
      } catch (error) {
        console.error("Erreur dans le chargement des données : ", error);
      }
    },

    set_pages() {
      this.nb_pages = Math.ceil(this.results_API.length / this.nb_graphs_pages);
    },
  },
  mounted() {
    this.fetchData(this.selectedTags);
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
</style>
