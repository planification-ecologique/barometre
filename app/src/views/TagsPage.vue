<template>
  <div class="fr-container--fluid ">
    <div class="fr-grid-row">
      <div class="fr-col">
        <div class="fr-container--fluid fr-container-page">
          <div>
            <Tags @tags-selected="updateSelection"></Tags>
          </div>
          <br>

          <div v-if="isapiloading === false">
            <h1 class="fr-subtitle">{{ this.results_API.length }} indicateurs trouvés</h1>
            <AdaptiveDashboard :dashboardPage="false" :inputData="results_API" />
          </div>
          <div v-else>
            <p>Chargement des indicateurs...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Tags from '../components/Tags.vue'
import AdaptiveDashboard from '../components/AdaptiveDashboard.vue'
import { api } from '@/services/api.js'

export default {
  name: 'TagsPage',
  components: {
    Tags,
    AdaptiveDashboard
  },
  data() {
    return {
pageTitle: "Baromètre SGPE - Tags",

      isapiloading: true,
      results_API: [],
      selectedTags: ["atténuation"]
    }
  },
  methods: {
    updateSelection(selectedTag) {
      this.isapiloading = true;
      // Build query based on selected tags and fetch data
      this.fetchData(selectedTag);
    },



    async fetchData(ls_tags) {
      var query = {
        "filter_by": [
          {
            "field": "label_tags",
            "values": ls_tags
          }
        ],
        "time_period": {
          "date_start": "2015-01-01",
          "date_end": "2031-01-01"
        }
      }
      // Call API
      try {
        const response = await api('/requests/get_indicators', {
          method: 'POST',
          body: JSON.stringify(query)
        });

        if (!response) {
          throw new Error("Erreur lors de l'appel à l'API");
        }

        // Retrieve data
        let results = response;
        this.results_API = results.data.results;
        this.isapiloading = false;
      } catch (error) {
        console.error("Erreur dans le chargement des données : ", error);
      }
    }
  },
  mounted() {
    this.fetchData(this.selectedTags);
  }
}
</script>

<style scoped lang="scss">
  .fr-container-page {
    background-color: #F6F6F6;
    padding-top: 1.5rem;
    padding-left: 2.5rem;
    padding-right: 2.5rem;
    width: 100%;
  }

  .fr-subtitle {
    font-weight: 400;
    }
</style>
