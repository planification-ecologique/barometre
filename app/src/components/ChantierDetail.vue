<template>
  <div>
    <!-- Chantier title and image -->
    <div class="fr-grid-row">
      <article class="fr-col-12" style="display: flex; align-items: center">
        <div class="sector-logo-container">
          <EnvironnementImg
            height="100px"
            width="100px"
            v-if="params.sector === 'Général' || params.sector === 'Transverse'"
          ></EnvironnementImg>
          <BatimentImg
            height="100px"
            width="100px"
            v-if="params.sector === 'Bâtiment'"
          ></BatimentImg>
          <TransportImg
            height="100px"
            width="100px"
            v-if="params.sector === 'Transports'"
          ></TransportImg>
          <AgricultureImg
            height="120px"
            width="100px"
            v-if="params.sector === 'Agriculture - Alimentation'"
          ></AgricultureImg>
          <IndustrieImg
            height="120px"
            width="100px"
            v-if="params.sector === 'Industrie'"
          ></IndustrieImg>
          <EnergieImg
            height="120px"
            width="100px"
            v-if="params.sector === 'Énergie' || params.sector === 'Energie'"
          ></EnergieImg>
          <EconomieImg
            height="120px"
            width="100px"
            v-if="params.sector === 'Déchets' || params.sector === 'Economie Circulaire'"
          ></EconomieImg>
          <EcosystemeImg
            height="120px"
            width="100px"
            v-if="params.sector === 'Terres & forêts'"
          ></EcosystemeImg>
        </div>
        <div>
          <h1 class="fr-title" :aria-label="params.chantier_name">
            {{ params.chantier_name }}
          </h1>
        </div>
      </article>
    </div>
    
    <!-- Chantier charts at the top -->
    <div v-if="chantierCharts.length > 0" class="fr-mb-5w">
      <h2 class="fr-h3">Indicateurs du chantier</h2>
      <div class="fr-grid-row fr-grid-row--gutters">
        <div
          v-for="(item, index) in chantierCharts"
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
    
    <!-- Leviers charts below -->
    <div v-if="leviersByLevier.length > 0" class="fr-mt-5w">
      <h2 class="fr-h3">Leviers</h2>
      <div v-for="(levierGroup, index) in leviersByLevier" :key="index" class="fr-mb-5w">
        <h3 class="fr-h4 levier-title">{{ levierGroup.name }}</h3>
        <div class="fr-grid-row fr-grid-row--gutters">
          <div
            v-for="(item, itemIndex) in levierGroup.indicators"
            :key="itemIndex"
            class="fr-col-md-6 fr-col-lg-6 fr-col-xl-6 fr-col-12"
          >
            <article>
              <graph-box
                :dataObj="item"
                :idAccordion="'levier-accordion-' + index + '-' + itemIndex"
                :titre="item.label_indic"
                :key="item.label_indic + '-' + index + '-' + itemIndex"
              ></graph-box>
            </article>
          </div>
        </div>
      </div>
    </div>
    
    <!-- No data message -->
    <div v-if="chantierCharts.length === 0 && leviersByLevier.length === 0">
      <p>Pas de données disponibles pour ce chantier.</p>
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
  name: "ChantierDetail",
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
    chantierData: {
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
      chantierCharts: [],
      leviersData: [],
      leviersByLevier: [],
      isLoadingLeviers: false,
    };
  },
  watch: {
    chantierData: {
      handler(newData) {
        this.updateChantierCharts(newData);
      },
      immediate: true,
    },
    params: {
      handler() {
        this.loadLeviersData();
      },
      immediate: true,
    },
    leviersData: {
      handler() {
        this.groupLeviersByName();
      },
      immediate: true,
    },
  },
  methods: {
    updateChantierCharts(data) {
      // Filter to show only chantier-level indicators
      this.chantierCharts = data || [];
    },
    async loadLeviersData() {
      if (!this.params.leviers || this.params.leviers.length === 0) {
        this.leviersData = [];
        return;
      }
      
      this.isLoadingLeviers = true;
      
      try {
        const mapping = planifecoMapping;
        const levierIds = [];
        
        // Get grist IDs for all leviers
        this.params.leviers.forEach(levierId => {
          if (mapping.leviers[levierId] && mapping.leviers[levierId].grist_ids) {
            levierIds.push(...mapping.leviers[levierId].grist_ids);
            console.log(`Levier ${levierId}: ${mapping.leviers[levierId].name}, grist_ids:`, mapping.leviers[levierId].grist_ids);
          } else {
            console.warn(`Levier ${levierId} non trouvé dans le mapping ou sans grist_ids`);
          }
        });
        
        console.log(`Total leviers à charger: ${this.params.leviers.length}, Total grist_ids: ${levierIds.length}`);
        
        if (levierIds.length > 0) {
          const query = {
            filter_by: [
              { field: "grist_ids", values: levierIds },
            ],
            time_period: {
              date_start: "2015-01-01",
              date_end: "2031-01-01",
            },
          };
          
          const response = await getIndicators(query, this.useStaging ? 'staging' : 'production');
          this.leviersData = response.results || [];
          console.log(`Indicateurs chargés depuis CSV: ${this.leviersData.length}`);
          this.groupLeviersByName();
        } else {
          this.leviersData = [];
          this.leviersByLevier = [];
        }
      } catch (error) {
        console.error("Erreur dans le chargement des données des leviers : ", error);
        this.leviersData = [];
        this.leviersByLevier = [];
      } finally {
        this.isLoadingLeviers = false;
      }
    },
    groupLeviersByName() {
      try {
        const mapping = planifecoMapping;
        if (!mapping || !mapping.leviers) {
          this.leviersByLevier = [];
          return;
        }
        
        // Group indicators by levier name
        const levierGroups = {};
        
        this.params.leviers.forEach(levierId => {
          const levier = mapping.leviers[levierId];
          if (levier && levier.grist_ids) {
            const levierName = levier.name || levier.short_name || `Levier ${levierId}`;
            
            if (!levierGroups[levierName]) {
              levierGroups[levierName] = {
                name: levierName,
                indicators: []
              };
            }
            
            // Find matching indicators
            levier.grist_ids.forEach(gristId => {
              const indicator = this.leviersData.find(item => item.id_indic === gristId);
              if (indicator && !levierGroups[levierName].indicators.find(e => e.id_indic === indicator.id_indic)) {
                levierGroups[levierName].indicators.push(indicator);
              }
            });
          }
        });
        
        this.leviersByLevier = Object.values(levierGroups);
      } catch (error) {
        console.error("Error grouping leviers by name:", error);
        this.leviersByLevier = [];
      }
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

.fr-h3 {
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.fr-h4 {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.levier-title {
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e5e5;
}
</style>
