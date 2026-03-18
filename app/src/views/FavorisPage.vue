<template>
  <div class="fr-container--fluid">
    <div class="fr-grid-row">
      <div class="fr-col">
        <div class="fr-container--fluid fr-container-page">
          <section>
            <div class="favoris-header">
              <span class="fr-icon-heart-fill favoris-header-icon" aria-hidden="true"></span>
              <h1 class="fr-title">Favoris</h1>
            </div>
            <p class="fr-text--sm fr-text-mention--grey fr-mb-3w" v-if="!isLoading && favorisIds.length > 0">
              {{ favorisIndicateurs.length }} indicateur{{ favorisIndicateurs.length > 1 ? 's' : '' }} sauvegardé{{ favorisIndicateurs.length > 1 ? 's' : '' }}
            </p>
          </section>

          <section>
            <div v-if="isLoading">
              <p>Chargement des indicateurs...</p>
            </div>
            <div v-else-if="favorisIndicateurs.length > 0">
              <div
                v-for="(row, index) in gridFormat"
                :key="index"
                class="fr-grid-row fr-grid-row--gutters fr-mb-1w"
              >
                <div
                  v-for="(item, columnIndex) in row"
                  :key="columnIndex"
                  class="fr-col-md-6 fr-col-lg-6 fr-col-xl-6 fr-col-12"
                >
                  <article>
                    <div v-if="!item"></div>
                    <div v-else>
                      <graph-box
                        :dataObj="item"
                        :idAccordion="'favori-accordion-' + index + columnIndex"
                        :key="item.label_indic + '-' + index + columnIndex"
                        @favori-changed="onFavoriChanged"
                      ></graph-box>
                    </div>
                  </article>
                </div>
              </div>
            </div>
            <div v-else class="favoris-empty">
              <span class="fr-icon-heart-line favoris-empty-icon" aria-hidden="true"></span>
              <h2 class="fr-h4">Aucun indicateur sauvegardé</h2>
              <p class="fr-text--sm fr-text-mention--grey">
                Cliquez sur l'icône <span class="fr-icon-heart-line" aria-hidden="true" style="font-size: 1rem; vertical-align: middle;"></span> sur un graphique pour l'ajouter à vos favoris.
              </p>
              <router-link
                :to="{ name: 'dashboard', query: { sector: 'Synthèse' } }"
                class="fr-btn fr-btn--secondary fr-mt-2w"
              >
                Parcourir les indicateurs
              </router-link>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import GraphBox from "../components/GraphBox.vue";
import { getFavoris } from "@/services/favorisService.js";
import { getIndicators } from "@/services/csvDataService.js";

export default {
  name: "FavorisPage",
  components: {
    GraphBox,
  },
  data() {
    return {
      isLoading: true,
      favorisIds: [],
      favorisIndicateurs: [],
      gridFormat: [],
    };
  },
  methods: {
    async loadFavoris() {
      this.isLoading = true;
      this.favorisIds = getFavoris();

      if (this.favorisIds.length === 0) {
        this.favorisIndicateurs = [];
        this.gridFormat = [];
        this.isLoading = false;
        return;
      }

      try {
        // Charger tous les indicateurs sans filtre
        const query = {
          filter_by: [],
          time_period: {
            date_start: "2015-01-01",
            date_end: "2031-01-01",
          },
        };
        const results = await getIndicators(query, "production");

        if (results && results.results) {
          // Filtrer pour ne garder que les favoris
          this.favorisIndicateurs = results.results.filter((indic) =>
            this.favorisIds.includes(indic.label_indic)
          );
        } else {
          this.favorisIndicateurs = [];
        }

        this.gridFormat = this.grid(this.favorisIndicateurs);
      } catch (error) {
        console.error("Erreur lors du chargement des favoris:", error);
        this.favorisIndicateurs = [];
        this.gridFormat = [];
      }

      this.isLoading = false;
    },
    grid(items) {
      const numRows = Math.ceil(items.length / 2) || 1;
      const numCols = 2;
      const result = Array.from({ length: numRows }, () =>
        Array(numCols).fill(null)
      );
      items.forEach((item, index) => {
        const row = Math.floor(index / numCols);
        const col = index % numCols;
        result[row][col] = item;
      });
      if (items.length % 2 === 1) {
        result[numRows - 1][numCols - 1] = null;
      }
      return result;
    },
    onFavoriChanged(event) {
      // Un favori a été retiré depuis cette page, recharger la liste
      if (!event.estFavori) {
        this.loadFavoris();
      }
    },
  },
  mounted() {
    this.loadFavoris();
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

.favoris-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.favoris-header-icon {
  color: #e1000f;
  font-size: 1.5rem;
}

.favoris-header .fr-title {
  margin-bottom: 0;
}

.favoris-empty {
  text-align: center;
  padding: 4rem 2rem;
}

.favoris-empty-icon {
  font-size: 3rem;
  color: var(--text-mention-grey, #666);
  display: block;
  margin-bottom: 1rem;
}
</style>
