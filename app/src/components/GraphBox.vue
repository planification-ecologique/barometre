<!-- Composant graphique principale dans chaque indicateur -->

<template>
  <div
    class="fr-card fr-card--no-icon fr-card--shadow adjust-height"
    v-if="dataObj"
  >
    <div class="titleBox">
      <h2 class="cardTitle">{{ dataObj.label_indic }}</h2>
      <!-- <TableComponent :captionTitle="dataObj.label_indic" /> -->
      <div class="fr-text--xs fr-text--bold cardObjectif" v-if="cible">
        <p class="fr-text--xs fr-text--regular fr-unit">Cible :</p>
        <p
          class="fr-badge fr-badge-sm fr-badge--green-emeraude fr-badge--no-icon fr-pr-1w"
        >
          {{ cible }}
        </p>
        <p class="fr-text--xs fr-text--regular fr-unit">
          {{ dataObj.label_unit }}
        </p>
      </div>
      <div v-else>
        <p class="fr-text--xs fr-text--regular fr-unit">
          Unité : {{ dataObj.label_unit }}
        </p>
      </div>
    </div>

    <div class="cardReference">
      <!-- Sélection du type de graphique (Graphique ou Tableau) -->
      <segmented-controls
        @chart-selected="handleChartSelected"
        :idcontrol="idAccordion + '1'"
      ></segmented-controls>
    </div>
    <div v-if="dataObj.values">
      <div class="cardData" v-if="this.displayChart">
        <!-- Affichage du graphique -->
        <div v-if="getChartType === 'Barres simple'">
          <!-- Composant Histogramme sans sous-groupe / DSFR -->
          <bar-chart
            :x="JSON.stringify(dataObj.values.x)"
            :y="JSON.stringify(dataObj.values.y)"
            :name="JSON.stringify(dataObj.values.legend)"
            :horizontal="false"
            :stacked="true"
            :color="JSON.stringify(dataObj.values.colors)"
            :aspectratio="2"
          >
          </bar-chart>
        </div>
        <div v-else-if="getChartType === 'Barres empilées'">
          <!-- Composant Histogramme avec sous-groupe / DSFR -->
          <bar-chart
            :x="JSON.stringify(dataObj.date)"
            :y="JSON.stringify(dataObj.values)"
            :aspectratio="2"
            :stacked="true"
            :name="JSON.stringify(dataObj.label_sous_groupe)"
          >
          </bar-chart>
        </div>
        <div v-else-if="getChartType === 'Courbes indépendantes'">
          <!-- Composant Ligne / DSFR -->
          <multi-line-chart
            :x="JSON.stringify(dataObj.date)"
            :y="JSON.stringify(dataObj.values)"
            :aspectratio="2"
            :name="JSON.stringify(dataObj.label_sous_groupe)"
            :isSmall="true"
          >
          </multi-line-chart>
        </div>
      </div>
      <!-- Affichage du tableau -->
      <div v-else>
        <div v-if="dataObj.label_sous_groupe == ''">
          <!-- Tableau sans sous-groupe -->
          <table-component
            :captionTitle="dataObj.label_indic"
            :annee="dataObj.values.x[0]"
            :valeur="dataObj.values.ytab"
            :type_mesure="dataObj.label_value"
          ></table-component>
        </div>
        <div v-else>
          <!-- Tableau avec sous-groupe -->
          <TableComponentVariant
            :annee="dataObj.date[0]"
            :valeurCol="dataObj.label_sous_groupe"
            :valeurValue="dataObj.values"
          ></TableComponentVariant>
        </div>
      </div>
    </div>
    <!-- Affichage des informations complémentaires sous le graphique -->
    <div class="beneathGraph fr-grid-row">

      <!-- Split la carte en deux colonnes"> -->
      <div class="fr-col-md-6 fr-col-lg-6 fr-col-xl-6 fr-col-12">
        <div v-if="dataObj.lien_donnees_source">
          <p class="fr-text--xs fr-text-mention--grey textReference">
          Source : <a :href="dataObj.lien_donnees_source" target="_blank" rel="noopener external">{{ dataObj.label_sources }}</a>
          </p>
        </div>
        <div v-else-if="dataObj.lien_site_source">
          <p class="fr-text--xs fr-text-mention--grey textReference">
          Source : <a :href="dataObj.lien_site_source" target="_blank" rel="noopener external">{{ dataObj.label_sources }}</a>
          </p>
        </div>
        <div v-else>
          <p class="fr-text--xs fr-text-mention--grey textReference">
          Source : {{ dataObj.label_sources }}
          </p>
        </div>
        <p class="fr-text--xs fr-text-mention--grey textReference">
          Périmètre : {{ dataObj.label_perimetre }}
        </p>
      </div>
      <div class="fr-col-md-6 fr-col-lg-6 fr-col-xl-6 fr-col-12">
        <a class="fr-link fr-link--download fr-link--download-text" id="link-3352" :href="downloadUrl" :download="getFilename()">
          Télécharger les données <span class="fr-link__detail">CSV – 1 ko</span>
        </a>
      </div>
    </div>
    <!-- Gestion du dropdown description -->
    <div class="fr-accordion">
      <h3 class="fr-accordion__title">
        <button
          class="fr-accordion__btn fr-text--xs"
          :aria-expanded="isAccordionOpen ? 'true' : 'false'"
          :aria-controls="idAccordion"
          title="Description de l'indicateur"
        >
          Description de l'indicateur
        </button>
      </h3>
      <div
        class="fr-collapse accordion-box"
        :id="idAccordion"
        :class="{ 'fr-collapse--expanded': isAccordionOpen }"
      >
        <p
          class="fr-text--s cardDescription fr-ml-1w fr-mr-1w fontSizeDescription"
        >
          {{ dataObj.label_description }}

          <br v-if="dataObj.label_description != ''"/>
          <br v-if="dataObj.label_description != ''"/>
          <i>Dernière mise à jour de l'indicateur : {{ dataObj.date_maj }}</i>
        </p>

        
        <div class="fr-ml-1w" v-if="dataObj.label_tags">
          <tags-card :tagsIndicateurs="dataObj.label_tags"></tags-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BarChart from "./components_dsfr/BarChart.vue";
import MultiLineChart from "./components_dsfr/MultiLineChart.vue";
import LineChart from "./components_dsfr/LineChart.vue";
import SegmentedControls from "./SegmentedControls.vue";
import tagsCard from "./TagsCard.vue";
import TableComponent from "./TableComponent.vue";
import TableComponentVariant from "./TableComponentVariant.vue";

export default {
  name: "GraphBox",
  components: {
    BarChart,
    SegmentedControls,
    tagsCard,
    TableComponent,
    TableComponentVariant,
    MultiLineChart,
    LineChart,
  },
  props: {
    dataObj: {
      type: Object,
      required: true,
    },
    idAccordion: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      displayChart: false,
      isAccordionOpen: true,
      cible: undefined,
    };
  },
  watch: {
    dataObj: function (){
      this.set_goal();
      
    }
  },
  computed: {
    downloadUrl() {
      let csvContent = '';
      
      try {
        // Ajout BOM pour UTF-8
        csvContent = '\uFEFF';
        
        if (!Array.isArray(this.dataObj.label_sous_groupe)) {
          // Pour les données sans sous-groupe
          const headers = ['Année', 'Valeur', 'Type'];
          csvContent = headers.join(';') + '\n';

          if (this.dataObj.values.x && this.dataObj.values.ytab) {
            for (let i = 0; i < this.dataObj.values.x.length; i++) {
              let row = [Array.isArray(this.dataObj.values.x) ? this.dataObj.values.x[i] : this.dataObj.values.x];
              
              row.push(this.dataObj.values.ytab[i] + ' ' + this.dataObj.label_unit);

              row.push(this.dataObj.label_value ? this.dataObj.label_value[i] || '' : '');
              
              csvContent += row.join(';') + '\n';
            }
          }
        } else {
          // Pour les données avec sous-groupe
          const headers = ['Année', ...this.dataObj.label_sous_groupe];
          csvContent += headers.join(';') + '\n';
          
          // Ajout des données
          if (this.dataObj.date && this.dataObj.values) {
            for (let i = 0; i < this.dataObj.date[0].length; i++) {
              let row = [this.dataObj.date[0][i]];
              
              for (let j = 0; j < this.dataObj.values.length; j++) {
                row.push(this.dataObj.values[j][i]);
              }
              
              csvContent += row.join(';') + '\n';
            }
          }
        }
        
        // Créer l'URL data avec encodage UTF-8
        return 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
      } catch (error) {
        console.error("Erreur lors de la création de l'URL de téléchargement:", error);
        return '#';
      }
    },
    getChartType() {
      try {
        // Check if type_de_graphique is explicitly set
        if (this.dataObj.type_de_graphique) {
          return this.dataObj.type_de_graphique;
        }
        
        // Determine chart type based on data structure
        const hasSousGroupe = this.dataObj.label_sous_groupe && 
                             (this.dataObj.label_sous_groupe.length > 0 || 
                              (Array.isArray(this.dataObj.label_sous_groupe) && this.dataObj.label_sous_groupe.length > 0));
        
        if (hasSousGroupe) {
          // If we have sub-groups, use Courbes indépendantes
          return 'Courbes indépendantes';
        } else {
          // Default to simple bar chart
          return 'Barres simple';
        }
      } catch (error) {
        console.error("Erreur dans la détermination du type de graphique:", error);
        return 'Barres simple'; // Default fallback
      }
    }
  },

  methods: {
    // Fonction pour afficher le graphique ou le tableau
    handleChartSelected(type) {
      this.displayChart = type === "graphique" ? true : false;
    },
    getFilename() {
      return `${this.dataObj.label_indic.replace(/[^\w\s]/gi, '')}_data.csv`;
    },

    set_goal () {
      try {
        // Formatage de la date de mise à jour
        // à l'origine : "2024-08-02 3:19pm" / "2024-08-01 9:37am"
        // replace the date with the new format
        if (this.dataObj.date_maj) {
          this.dataObj.date_maj = this.dataObj.date_maj.split(" ")[0];
        } else {
          this.dataObj.date_maj = "Date non disponible";
        }
        
        // Calcul de la cible
        if (
          this.dataObj.label_sous_groupe == undefined ||
          this.dataObj.label_sous_groupe == ""
        ) {
          let index = this.dataObj.values.legend.indexOf("Cible");
          index != -1
            ? (this.cible =
                this.dataObj.values.y[index][
                  this.dataObj.values.y[index].length - 1
                ])
            : (this.cible = undefined);
        } else {
          this.cible = undefined;
        }
      } catch (error) {
        console.log("Erreur dans la cible", error);
      }
    },
  },
  mounted() {    
    this.set_goal();
  }
};
</script>

<style scoped>
.fontSizeDescription {
  font-size: 12px;
}
.fr-unit {
  margin-bottom: 0rem !important;
}
.accordion-box {
  padding-bottom: 1rem !important;
}
.adjust-height {
  height: auto !important;
  z-index: inherit;
}
.beneathGraph {
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #dddddd;
  border-top: 1px solid #dddddd;
  /* display: block; */
  justify-content: space-around;
}
.cardReference {
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #dddddd;
  border-top: 1px solid #dddddd;
  display: flex;
  justify-content: space-between;
}
.titleBox {
  padding: 0.5rem 1rem;
  margin-top: 0.5rem;
}
.cardTitle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bolder;
  margin-bottom: 0.5rem;
}
.cardData {
  padding-top: 1.5rem;
  padding-left: 0.75rem;
  padding-right: 1.5rem;
  max-width: 100%;
}
.cardFooter {
  padding: 0.5rem 1rem;
  display: flex;
  justify-content: space-between;
}
.cardFooter > .cardFooter-button {
  display: flex;
  justify-content: flex-end;
  column-gap: 0.5rem;
}
.cardFooter > .cardFooter-tags {
  display: flex;
  justify-content: flex-start;
  column-gap: 1em;
}
p.cardDescription {
  font-size: 1rem;
  line-height: 1.25rem;
  font-weight: 400;
  text-align: justify;
  text-justify: inter-word;
  margin-bottom: 1rem;
  color: black;
}

.unit-short {
  margin-bottom: 0rem !important;
}
.cardObjectif {
  display: flex;
  justify-content: flex-start;
  font-size: 0.75rem;
  align-items: center;
  column-gap: 0.5rem;
  margin-bottom: 0rem;
}
p.textReference {
  margin-bottom: 0rem;
  font-weight: 400;
}

.fr-link--download-text {
  font-size: small !important;
  /* align-items: flex-end !important; */
}

</style>
