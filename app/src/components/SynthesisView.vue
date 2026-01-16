<template>
  <div>
    <!-- Sector title and image -->
    <div class="fr-grid-row">
      <article class="fr-col-12" style="display: flex; align-items: center">
        <div class="sector-logo-container">
          <EnvironnementImg
            height="100px"
            width="100px"
            v-if="sector === 'Général' || sector === 'Transverse'"
          ></EnvironnementImg>
          <BatimentImg
            height="100px"
            width="100px"
            v-if="sector === 'Bâtiment'"
          ></BatimentImg>
          <TransportImg
            height="100px"
            width="100px"
            v-if="sector === 'Transports'"
          ></TransportImg>
          <AgricultureImg
            height="120px"
            width="100px"
            v-if="sector === 'Agriculture - Alimentation'"
          ></AgricultureImg>
          <IndustrieImg
            height="120px"
            width="100px"
            v-if="sector === 'Industrie'"
          ></IndustrieImg>
          <EnergieImg
            height="120px"
            width="100px"
            v-if="sector === 'Énergie' || sector === 'Energie'"
          ></EnergieImg>
          <EconomieImg
            height="120px"
            width="100px"
            v-if="sector === 'Déchets' || sector === 'Economie Circulaire'"
          ></EconomieImg>
          <EcosystemeImg
            height="120px"
            width="100px"
            v-if="sector === 'Terres & forêts'"
          ></EcosystemeImg>
        </div>
        <div>
          <h1 class="fr-title" :aria-label="sector">
            {{ sector }}
          </h1>
          <h2 class="fr-subtitle">Synthèse</h2>
        </div>
      </article>
    </div>
    
    <!-- Engagements section -->
    <div v-if="engagementsData.length > 0" class="fr-mt-5w">
      <div class="section-header">
        <h2 class="fr-h3">Engagements</h2>
        <p class="fr-text--sm section-description">
          Les engagements représentent les objectifs environnementaux concrets associés à des références légales ou réglementaires.
        </p>
      </div>
      <div class="fr-grid-row fr-grid-row--gutters fr-mb-5w">
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
    
    <!-- Chantiers section -->
    <div v-if="chantiersData.length > 0" class="fr-mt-5w">
      <div class="section-header">
        <h2 class="fr-h3">Chantiers</h2>
        <p class="fr-text--sm section-description">
          Les chantiers regroupent les transformations tangibles nécessaires pour respecter les engagements, organisées en leviers opérationnels.
        </p>
      </div>
      <div class="fr-grid-row fr-grid-row--gutters">
        <div
          v-for="(item, index) in chantiersData"
          :key="index"
          class="fr-col-md-6 fr-col-lg-6 fr-col-xl-6 fr-col-12"
        >
          <article>
            <graph-box
              :dataObj="item"
              :idAccordion="'chantier-accordion-' + index"
              :titre="item.label_indic"
              :key="item.label_indic + '-' + index"
            ></graph-box>
          </article>
        </div>
      </div>
    </div>
    
    <!-- No data message -->
    <div v-if="engagementsData.length === 0 && chantiersData.length === 0" class="fr-mt-5w">
      <p>Pas de données disponibles pour ce secteur.</p>
    </div>
  </div>
</template>

<script>
import GraphBox from "./GraphBox.vue";
import TransportImg from "./components_sgv/TransportImg.vue";
import BatimentImg from "./components_sgv/BatimentImg.vue";
import AgricultureImg from "./components_sgv/AgricultureImg.vue";
import IndustrieImg from "./components_sgv/IndustrieImg.vue";
import EnergieImg from "./components_sgv/EnergieImg.vue";
import EconomieImg from "./components_sgv/EconomieImg.vue";
import EnvironnementImg from "./components_sgv/EnvironnementImg.vue";
import EcosystemeImg from "./components_sgv/EcosystemeImg.vue";
import { getIndicators } from "@/services/csvDataService.js";
import planifecoMapping from "@/utils/planifeco_mapping.js";

export default {
  name: "SynthesisView",
  components: {
    GraphBox,
    TransportImg,
    BatimentImg,
    AgricultureImg,
    IndustrieImg,
    EnergieImg,
    EconomieImg,
    EnvironnementImg,
    EcosystemeImg,
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
      chantiersData: [],
      sector: 'Général',
    };
  },
  watch: {
    inputData: {
      handler(newData) {
        this.separateEngagementsAndChantiers(newData);
      },
      immediate: true,
    },
    params: {
      handler(newParams) {
        if (newParams && newParams.sector) {
          this.sector = newParams.sector;
        }
        this.loadEngagementsAndChantiers();
      },
      immediate: true,
    },
  },
  methods: {
    async loadEngagementsAndChantiers() {
      if (!this.params || !this.params.sector) {
        return;
      }
      
      this.sector = this.params.sector;
      
      try {
        const mapping = planifecoMapping;
        if (!mapping) {
          return;
        }
        
        // Get engagement IDs for current sector
        const engagementIds = [];
        if (mapping.engagements) {
          Object.values(mapping.engagements)
            .filter(eng => eng.sector === this.sector)
            .forEach(eng => {
              if (eng.grist_ids) {
                engagementIds.push(...eng.grist_ids);
              }
            });
        }
        
        // Get chantier IDs for current sector
        const chantierIds = [];
        if (mapping.chantiers) {
          Object.values(mapping.chantiers)
            .filter(chantier => chantier.sector === this.sector)
            .forEach(chantier => {
              if (chantier.grist_ids) {
                chantierIds.push(...chantier.grist_ids);
              }
            });
        }
        
        // Load engagements data
        if (engagementIds.length > 0) {
          const engagementQuery = {
            filter_by: [
              { field: "grist_ids", values: engagementIds },
            ],
            time_period: {
              date_start: "2015-01-01",
              date_end: "2031-01-01",
            },
          };
          const engagementResponse = await getIndicators(engagementQuery, this.useStaging ? 'staging' : 'production');
          this.engagementsData = engagementResponse.results || [];
        } else {
          this.engagementsData = [];
        }
        
        // Load chantiers data
        if (chantierIds.length > 0) {
          const chantierQuery = {
            filter_by: [
              { field: "grist_ids", values: chantierIds },
            ],
            time_period: {
              date_start: "2015-01-01",
              date_end: "2031-01-01",
            },
          };
          const chantierResponse = await getIndicators(chantierQuery, this.useStaging ? 'staging' : 'production');
          this.chantiersData = chantierResponse.results || [];
        } else {
          this.chantiersData = [];
        }
      } catch (error) {
        console.error("Erreur dans le chargement des données de synthèse : ", error);
        this.engagementsData = [];
        this.chantiersData = [];
      }
    },
    separateEngagementsAndChantiers(data) {
      // This method can be used if we want to separate from already loaded data
      // For now, we load them separately
    },
  },
  mounted() {
    this.loadEngagementsAndChantiers();
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

.section-header {
  margin-bottom: 1.5rem;
}

.section-description {
  color: #666;
  margin-top: 0.5rem;
  margin-bottom: 0;
}

.fr-h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}
</style>
