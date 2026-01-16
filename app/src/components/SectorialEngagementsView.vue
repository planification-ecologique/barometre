<template>
  <div>
    <!-- Sector title and image -->
    <div class="fr-grid-row">
      <article class="fr-col-12" style="display: flex; align-items: center">
        <div class="sector-logo-container">
          <SectorIcon
            :sector="sector"
            height="100px"
            width="100px"
          />
        </div>
        <div>
          <h1 class="fr-title">{{ sector }}</h1>
          <h2 class="fr-subtitle">Nos Engagements</h2>
        </div>
      </article>
    </div>
    
    <!-- Engagements for this sector -->
    <div v-if="engagementsData.length > 0" class="fr-mt-5w">
      <div class="fr-grid-row fr-grid-row--gutters">
        <div
          v-for="(item, index) in engagementsData"
          :key="index"
          class="fr-col-md-6 fr-col-lg-6 fr-col-xl-6 fr-col-12"
        >
          <article>
            <graph-box
              :dataObj="item"
              :idAccordion="'engagement-accordion-' + index"
              :titre="item.label_indic"
              :key="item.label_indic + '-' + index"
            ></graph-box>
          </article>
        </div>
      </div>
    </div>
    
    <!-- No data message -->
    <div v-if="engagementsData.length === 0" class="fr-mt-5w">
      <p>Pas de données disponibles pour les engagements de ce secteur.</p>
    </div>
  </div>
</template>

<script>
import GraphBox from "./GraphBox.vue";
import SectorIcon from "./SectorIcon.vue";

export default {
  name: "SectorialEngagementsView",
  components: {
    GraphBox,
    SectorIcon,
  },
  props: {
    params: {
      type: Object,
      required: true,
    },
    inputData: {
      type: Array,
      default: () => [],
    },
    useStaging: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      engagementsData: [],
      sector: 'Général',
    };
  },
  watch: {
    inputData: {
      handler(newData) {
        this.engagementsData = newData || [];
      },
      immediate: true,
    },
    params: {
      handler(newParams) {
        if (newParams && newParams.sector) {
          this.sector = newParams.sector;
        }
      },
      immediate: true,
    },
  },
};
</script>

<style scoped lang="scss">
.sector-logo-container {
  margin-right: 1.5rem;
  flex-shrink: 0;
}

.fr-title {
  margin-bottom: 0.625rem;
}

.fr-subtitle {
  font-weight: 400;
  color: #666;
}
</style>
