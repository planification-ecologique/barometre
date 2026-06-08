<template>
  <div :class="isAxeDetailView ? 'axe-detail' : 'engagements-overview'">
    <!-- Axe detail view: same look and feel as ChantierDetail -->
    <template v-if="isAxeDetailView">
      <nav class="fr-breadcrumb" aria-label="vous êtes ici :">
        <ol class="fr-breadcrumb__list">
          <li>
            <a class="fr-breadcrumb__link" href="#" @click.prevent="goAccueil">Accueil</a>
          </li>
          <li>
            <a class="fr-breadcrumb__link" href="#" @click.prevent="goEtatEnvironnement">Etat de l'environnement</a>
          </li>
          <li>
            <span class="fr-breadcrumb__link" aria-current="page">{{ params.axe }}</span>
          </li>
        </ol>
      </nav>

      <section class="axe-hero">
        <h1 class="fr-title axe-title" :aria-label="params.axe">{{ params.axe }}</h1>
        <nav
          v-if="axeIndicateurHeaderTags.length > 0 || axeSectorTags.length > 0"
          class="chantier-metadata-tags"
          aria-label="Métadonnées de l'axe"
        >
          <div v-if="axeIndicateurHeaderTags.length > 0" class="chantier-tags-row">
            <span class="chantier-tags-row__label">Indicateurs</span>
            <a
              v-for="tag in axeIndicateurHeaderTags"
              :key="'ind-' + tag.id"
              class="chantier-metadata-tag chantier-metadata-tag--indicateur"
              :href="tag.href"
            >
              <span class="ri-target-line chantier-metadata-tag__icon" aria-hidden="true"></span>
              <span class="chantier-metadata-tag__text">{{ tag.label }}</span>
            </a>
          </div>
          <div v-if="axeSectorTags.length > 0" class="chantier-tags-row">
            <span class="chantier-tags-row__label">Secteurs</span>
            <a
              v-for="tag in axeSectorTags"
              :key="'sector-' + tag.id"
              class="chantier-metadata-tag chantier-metadata-tag--levier"
              :href="tag.href"
            >
              <span class="ri-target-line chantier-metadata-tag__icon" aria-hidden="true"></span>
              <span class="chantier-metadata-tag__text">{{ tag.label }}</span>
            </a>
          </div>
        </nav>
      </section>

      <section class="axe-summary" :id="sectionIndicateurImpactId">
        <h2 class="fr-h4 axe-section-title">Ce qu'il faut retenir</h2>
        <div class="axe-summary-copy fr-text--md" v-html="axeRetenirBodyHtml"></div>
        <!-- Graphes des indicateurs clés (à l'intérieur du Ce qu'il faut retenir) -->
        <div v-if="currentAxeEntry && currentAxeEntry.impactIndicators && currentAxeEntry.impactIndicators.length > 0" class="fr-grid-row fr-grid-row--gutters fr-mt-3w">
          <div v-for="(item, itemIndex) in currentAxeEntry.impactIndicators" :key="item.label_indic + '-impact-' + itemIndex" class="fr-col-md-6 fr-col-lg-6 fr-col-xl-6 fr-col-12">
            <article :id="getIndicatorSectionId('impact', itemIndex)" class="axe-indicator-card">
              <graph-box :dataObj="item" :compact="true" :idAccordion="'axe-accordion-impact-' + itemIndex" :titre="item.label_indic" />
            </article>
          </div>
        </div>
        <p v-else-if="currentAxeEntry" class="fr-text--sm fr-text--alt axe-empty-state fr-mt-3w">Aucun indicateur d'impact n'est encore défini pour cet axe.</p>
      </section>

      <!-- Secteurs avec indicateurs d'impact sectoriels (Consommer, Se déplacer, etc. - hors Synthèse) -->
      <section
        v-for="(sectorEntry, sectorIdx) in impactIndicatorsBySector"
        :key="'sector-' + sectorEntry.sector + '-' + sectorIdx"
        :id="getSectorSectionId(sectorEntry.sector)"
        class="axe-section axe-section--highlighted"
      >
        <h2 class="fr-h3 axe-section-title">
          <span class="section-chip section-chip--secteur section-chip--in-title">Secteur</span>
          {{ sectorEntry.sector }}
        </h2>
        <div class="fr-grid-row fr-grid-row--gutters">
          <div v-for="(item, itemIndex) in sectorEntry.indicators" :key="item.label_indic + '-' + sectorEntry.sector + '-' + itemIndex" class="fr-col-md-6 fr-col-lg-6 fr-col-xl-6 fr-col-12">
            <article :id="getIndicatorSectionId(sectorEntry.sector, itemIndex)" class="axe-indicator-card">
              <graph-box :dataObj="item" :compact="true" :idAccordion="'axe-accordion-' + sectorEntry.sector + '-' + itemIndex" :titre="item.label_indic" />
            </article>
          </div>
        </div>
      </section>

      <section v-if="currentAxeEntry && currentAxeEntry.autresIndicators && currentAxeEntry.autresIndicators.length > 0" :id="sectionAutresIndicateursId" class="axe-section">
        <h2 class="fr-h3 axe-section-title levier-title">
          <span class="section-chip section-chip--indicateur section-chip--in-title">Indicateur</span>
          Autres indicateurs
        </h2>
        <div class="fr-grid-row fr-grid-row--gutters">
          <div v-for="(item, itemIndex) in currentAxeEntry.autresIndicators" :key="item.label_indic + '-autres-' + itemIndex" class="fr-col-md-6 fr-col-lg-6 fr-col-xl-6 fr-col-12">
            <article :id="getIndicatorSectionId('autres', itemIndex)" class="axe-indicator-card">
              <graph-box :dataObj="item" :compact="true" :idAccordion="'axe-accordion-autres-' + itemIndex" :titre="item.label_indic" />
            </article>
          </div>
        </div>
      </section>

      <!-- Même grille qu'en synthèse (« {axe} - autres »), filtrée sur l'axe courant -->
      <section
        v-if="currentAxeImpactAutresIndicators.length > 0"
        :id="sectionImpactAutresId"
        class="axe-section"
      >
        <h2 class="fr-h3 axe-section-title levier-title">
          <span class="section-chip section-chip--indicateur section-chip--in-title">Indicateur</span>
          {{ resolvedAxeNomComplet }} - autres
        </h2>
        <div class="fr-grid-row fr-grid-row--gutters">
          <div
            v-for="(item, itemIndex) in currentAxeImpactAutresIndicators"
            :key="item.label_indic + '-impact-autres-' + itemIndex"
            class="fr-col-md-6 fr-col-lg-6 fr-col-xl-6 fr-col-12"
          >
            <article :id="getIndicatorSectionId('impact-autres', itemIndex)" class="axe-indicator-card">
              <graph-box
                :dataObj="item"
                :compact="true"
                :idAccordion="'axe-accordion-impact-autres-' + itemIndex"
                :titre="item.label_indic"
              />
            </article>
          </div>
        </div>
      </section>

      <div v-if="axeDetailEmpty && !isAdaptationAxeDetail" class="axe-state">
        <p>Pas de données disponibles pour cet axe.</p>
      </div>
    </template>

    <!-- Overview: all axes (no axe filter) -->
    <template v-else>
      <div class="fr-grid-row">
        <article class="fr-col-12" style="display: flex; align-items: center">
          <div class="sector-logo-container">
            <EnvironnementImg height="100px" width="100px" />
          </div>
          <div>
            <h1 class="fr-title">Synthèse</h1>
            <h2 class="fr-subtitle">Indicateurs d'impact</h2>
          </div>
        </article>
      </div>

      <div v-for="entry in sortedAxesEntries" :key="'axe-' + entry.axe" class="fr-mt-5w">
        <div class="section-header">
          <h2 class="fr-h3">{{ entry.axe }}</h2>
        </div>
        <div v-if="entry.impactIndicators && entry.impactIndicators.length > 0" class="fr-grid-row fr-grid-row--gutters fr-mb-5w">
        <div
          v-for="(item, index) in entry.impactIndicators"
          :key="'impact-' + index"
          class="fr-col-md-6 fr-col-lg-6 fr-col-xl-6 fr-col-12"
        >
          <article>
            <graph-box
              :dataObj="item"
              :idAccordion="'engagement-accordion-' + entry.axe + '-impact-' + index"
              :titre="item.label_indic"
              :key="item.label_indic + '-' + entry.axe + '-impact-' + index"
            ></graph-box>
          </article>
        </div>
      </div>
      
      <!-- Separator: "Autres indicateurs" -->
      <div v-if="entry.autresIndicators && entry.autresIndicators.length > 0" class="fr-mt-5w">
        <div class="section-header">
          <h3 class="fr-h4">Autres indicateurs</h3>
        </div>
        <div class="fr-grid-row fr-grid-row--gutters fr-mb-5w">
          <div
            v-for="(item, index) in entry.autresIndicators"
            :key="'autres-' + index"
            class="fr-col-md-6 fr-col-lg-6 fr-col-xl-6 fr-col-12"
          >
            <article>
              <graph-box
                :dataObj="item"
                :idAccordion="'engagement-accordion-' + entry.axe + '-autres-' + index"
                :titre="item.label_indic"
                :key="item.label_indic + '-' + entry.axe + '-autres-' + index"
              ></graph-box>
            </article>
          </div>
        </div>
      </div>
    </div>
    
      <!-- Indicateur d'impact - autres: under chantier name (no submenu), sorted alphabetically, below normal indicators -->
      <div v-for="entry in sortedChantierAutresEntries" :key="'chantier-' + entry.chantierName" class="fr-mt-5w">
        <div class="section-header">
          <h2 class="fr-h3">{{ entry.chantierName }} - autres</h2>
        </div>
        <div class="fr-grid-row fr-grid-row--gutters fr-mb-5w">
          <div
            v-for="(item, index) in entry.engagements"
            :key="index"
            class="fr-col-md-6 fr-col-lg-6 fr-col-xl-6 fr-col-12"
          >
            <article>
              <graph-box
                :dataObj="item"
                :idAccordion="'engagement-accordion-autres-' + entry.chantierName + '-' + index"
                :titre="item.label_indic"
              />
            </article>
          </div>
        </div>
      </div>
    
      <div v-if="sortedAxesEntries.length === 0 && sortedChantierAutresEntries.length === 0" class="fr-mt-5w">
        <p v-if="isAdaptationAxeDetail">
        <br />
        Bien que la France soit dotée d’un Plan national d’adaptation au changement climatique (
        <a href="https://www.ecologie.gouv.fr/sites/default/files/documents/PNACC3.pdf" target="_blank" rel="noopener noreferrer">PNACC3</a>,
        publié en mars 2025), les méthodes d’évaluation quantitative qui en découlent font défaut, d’où l’absence d’indicateurs dans ce baromètre à date. Cela tient tant à la difficulté d’élaborer des projections des conséquences du changement climatique qu’au caractère systémique des politiques d’adaptation, celles-ci portant sur des enjeux physiques et organisationnels. A ce stade, le pilotage de la politique d’adaptation repose essentiellement sur l’observation de l’évolution de la sinistralité et des moyens déployés en matière de prévention.
      </p>
      <p v-else>Pas de données disponibles pour les engagements.</p>
    </div>
    </template>
  </div>
</template>

<script>
import GraphBox from "./GraphBox.vue";
import EnvironnementImg from "./components_sgv/EnvironnementImg.vue";
import {
  normalizeImpactAxeName,
  canonicalImpactAxeNomComplet,
  impactAxeSlugFromNomComplet,
  impactAxeRetenirHtml,
  compareChantierNamesByListeOrder,
  getChantierListeOrderIndexMap,
} from "@/services/csvDataService.js";
import { homeRouteName, etatEnvironnementRouteName } from "@/config/routeNames.js";
import { SECTION_SYNTHESE_SLUG } from "@/utils/sectionUrl.js";

export default {
  name: "GeneralEngagementsView",
  components: {
    GraphBox,
    EnvironnementImg,
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
      engagementsByAxe: {},
      engagementsByChantierAutres: {},  // "Indicateur d'impact - autres" grouped by chantier name
      engagementsByAxeAndSector: {},    // axe -> { sector -> [indicators] } for "Indicateur d'impact"
      chantierListeOrderMap: new Map(),
    };
  },
  created() {
    getChantierListeOrderIndexMap().then((m) => {
      this.chantierListeOrderMap = m;
    });
  },
  computed: {
    filteredEngagementsByAxe() {
      const result = {};
      Object.entries(this.engagementsByAxe).forEach(([axe, engagements]) => {
        const filterAxe =
          canonicalImpactAxeNomComplet(this.params.axe) || this.params.axe;
        if (this.params.axe && axe !== filterAxe) return;
        if (engagements && engagements.length > 0) result[axe] = engagements;
      });
      return result;
    },
    // "Indicateur d'impact - autres" par axe ; en vue détail une section dédiée (currentAxeImpactAutresIndicators)
    filteredEngagementsByChantierAutres() {
      if (this.params.axe) return {};
      const result = {};
      Object.entries(this.engagementsByChantierAutres).forEach(([chantierName, engagements]) => {
        if (engagements && engagements.length > 0) result[chantierName] = engagements;
      });
      return result;
    },
    /** Indicateurs levier « Indicateur d'impact - autres » pour l'axe courant uniquement (vue détail) */
    currentAxeImpactAutresIndicators() {
      const id = this.resolvedAxeNomComplet;
      if (!id) return [];
      const raw = this.engagementsByChantierAutres[id];
      if (!Array.isArray(raw) || raw.length === 0) return [];
      return [...raw].sort((a, b) =>
        (a.label_indic || '').localeCompare(b.label_indic || '', 'fr', { sensitivity: 'base' })
      );
    },
    // Axes sorted alphabetically (normal indicators, shown first)
    // Split each axe's engagements into "Indicateur d'impact" (Synthèse only) and "Autres indicateurs"
    // Les indicateurs d'impact sectoriels (Préserver, Consommer, etc.) sont dans impactIndicatorsBySector
    sortedAxesEntries() {
      return Object.entries(this.filteredEngagementsByAxe)
        .map(([axe, engagements]) => {
          const impactIndicators = [];
          const autresIndicators = [];
          
          // Indicateurs d'impact : uniquement secteur Synthèse (les autres sont dans les sections secteurs)
          const syntheseImpact = (this.engagementsByAxeAndSector[axe] && this.engagementsByAxeAndSector[axe]['Synthèse']) || [];
          impactIndicators.push(...syntheseImpact);
          
          engagements.forEach(item => {
            const levier = (item.levier || '').toString();
            // "Autres indicateurs" (hors "Indicateur d'impact - autres") → section Autres indicateurs
            if (levier.includes("Autres indicateurs") && !levier.includes("Indicateur d'impact - autres")) {
              autresIndicators.push(item);
            }
          });
          
          return {
            axe,
            impactIndicators,
            autresIndicators,
            engagements
          };
        })
        .filter(entry => entry.impactIndicators.length > 0 || entry.autresIndicators.length > 0)
        .sort((a, b) => a.axe.localeCompare(b.axe, 'fr'));
    },
    // Chantier "autres" sections: ordre Liste_chantiers (puis alphabétique si absent de la liste)
    sortedChantierAutresEntries() {
      return Object.entries(this.filteredEngagementsByChantierAutres)
        .map(([chantierName, engagements]) => ({ chantierName, engagements }))
        .sort((a, b) =>
          compareChantierNamesByListeOrder(
            a.chantierName,
            b.chantierName,
            this.chantierListeOrderMap
          )
        );
    },
    isAxeDetailView() {
      return !!this.params.axe;
    },
    resolvedAxeNomComplet() {
      if (!this.params.axe) return null;
      return canonicalImpactAxeNomComplet(this.params.axe) || this.params.axe;
    },
    resolvedAxeSlug() {
      const n = this.resolvedAxeNomComplet;
      return n ? impactAxeSlugFromNomComplet(n) : null;
    },
    isAdaptationAxeDetail() {
      return this.resolvedAxeSlug === 'adaptation';
    },
    currentAxeEntry() {
      const id = this.resolvedAxeNomComplet;
      if (!id) return null;
      return this.sortedAxesEntries.find((e) => e.axe === id) || null;
    },
    /** Secteurs avec indicateurs d'impact sectoriels pour l'axe courant (hors Synthèse : Consommer, Se déplacer, etc.) */
    impactIndicatorsBySector() {
      const axeKey = this.resolvedAxeNomComplet;
      if (!axeKey) return [];
      const bySector = this.engagementsByAxeAndSector[axeKey];
      if (!bySector || typeof bySector !== 'object') return [];
      return Object.entries(bySector)
        .filter(([sector, indicators]) => sector !== 'Synthèse' && indicators && indicators.length > 0)
        .map(([sector, indicators]) => ({ sector, indicators }))
        .sort((a, b) => (a.sector || '').localeCompare(b.sector || '', 'fr'));
    },
    axeSectionLinks() {
      const links = [];
      if (this.currentAxeEntry && (this.currentAxeEntry.impactIndicators?.length > 0 || this.currentAxeEntry.autresIndicators?.length > 0)) {
        links.push({ id: this.sectionIndicateurImpactId, label: "Indicateurs d'impact" });
        if (this.currentAxeEntry.autresIndicators?.length > 0) {
          links.push({ id: this.sectionAutresIndicateursId, label: "Autres indicateurs" });
        }
      }
      return links;
    },
    axeIndicateurTags() {
      if (!this.currentAxeEntry?.impactIndicators?.length) return [];
      return this.currentAxeEntry.impactIndicators.map((item, idx) => ({
        id: this.getIndicatorSectionId('impact', idx),
        label: item.label_indic || `Indicateur ${idx + 1}`,
        href: '#' + this.getIndicatorSectionId('impact', idx),
      }));
    },
    axeSectorTags() {
      return this.impactIndicatorsBySector.map(se => ({
        id: this.getSectorSectionId(se.sector),
        label: `${se.sector} (${se.indicators?.length || 0})`,
        href: '#' + this.getSectorSectionId(se.sector),
      }));
    },
    axeAutresIndicateursTag() {
      const count = this.currentAxeEntry?.autresIndicators?.length || 0;
      if (count === 0) return null;
      return {
        id: this.sectionAutresIndicateursId,
        label: `Autres indicateurs (${count})`,
        href: '#' + this.sectionAutresIndicateursId,
      };
    },
    axeImpactAutresTag() {
      const count = this.currentAxeImpactAutresIndicators.length;
      if (count === 0 || !this.resolvedAxeNomComplet) return null;
      return {
        id: this.sectionImpactAutresId,
        label: `${this.resolvedAxeNomComplet} - autres (${count})`,
        href: '#' + this.sectionImpactAutresId,
      };
    },
    axeIndicateurHeaderTags() {
      const tags = [...this.axeIndicateurTags];
      if (this.axeAutresIndicateursTag) tags.push(this.axeAutresIndicateursTag);
      if (this.axeImpactAutresTag) tags.push(this.axeImpactAutresTag);
      return tags;
    },
    axeMetadataTags() {
      const tags = [...this.axeIndicateurTags, ...this.axeSectorTags];
      if (this.axeAutresIndicateursTag) tags.push(this.axeAutresIndicateursTag);
      if (this.axeImpactAutresTag) tags.push(this.axeImpactAutresTag);
      return tags;
    },
    sectionIndicateurImpactId() {
      return 'section-indicateurs-impact';
    },
    sectionAutresIndicateursId() {
      return 'section-autres-indicateurs';
    },
    sectionImpactAutresId() {
      return 'section-indicateur-impact-autres';
    },
    axeSummaryHtml() {
      const fromTaxo = impactAxeRetenirHtml(this.resolvedAxeNomComplet);
      if (fromTaxo) return fromTaxo;
      return "Retrouvez sur cette page les principaux indicateurs d'impact et les autres indicateurs associes a cet axe.";
    },
    /** Paragraphe PNACC3 affiché dans « Ce qu'il faut retenir » lorsque l'axe Adaptation n'a pas d'indicateurs. */
    pnaccAdaptationEmptyHtml() {
      return (
        "Bien que la France soit dotée d'un Plan national d'adaptation au changement climatique (" +
        '<a href="https://www.ecologie.gouv.fr/sites/default/files/documents/PNACC3.pdf" target="_blank" rel="noopener noreferrer">PNACC3</a>, ' +
        "publié en mars 2025), les méthodes d'évaluation quantitative qui en découlent font défaut, d'où l'absence d'indicateurs dans ce baromètre à date. " +
        "Cela tient tant à la difficulté d'élaborer des projections des conséquences du changement climatique qu'au caractère systémique des politiques d'adaptation, " +
        "celles-ci portant sur des enjeux physiques et organisationnels. A ce stade, le pilotage de la politique d'adaptation repose essentiellement sur " +
        "l'observation de l'évolution de la sinistralité et des moyens déployés en matière de prévention."
      );
    },
    axeRetenirBodyHtml() {
      if (this.isAxeDetailView && this.isAdaptationAxeDetail && this.axeDetailEmpty) {
        return this.pnaccAdaptationEmptyHtml;
      }
      return this.axeSummaryHtml;
    },
    axeDetailEmpty() {
      if (!this.isAxeDetailView) return false;
      const hasMain =
        !!this.currentAxeEntry ||
        this.impactIndicatorsBySector.length > 0;
      const hasImpactAutres = this.currentAxeImpactAutresIndicators.length > 0;
      return !hasMain && !hasImpactAutres;
    },
  },
  watch: {
    inputData: {
      handler(newData) {
        if (newData && newData.length > 0) {
          this.groupEngagementsByAxe(newData);
        }
      },
      immediate: true,
    },
  },
  mounted() {
    if (this.inputData && this.inputData.length > 0) {
      this.groupEngagementsByAxe(this.inputData);
    }
  },
  methods: {
    groupEngagementsByAxe(data) {
      try {
        const axeGroups = {};
        const chantierAutresGroups = {};
        const axeAndSectorGroups = {};  // axe -> { sector -> [indicators] } for Indicateur d'impact
        const seenByAxe = new Set();
        const seenByChantierAutres = new Set();
        const seenByAxeSector = new Set();

        // Build (chantierOuImpact, sector) pairs from parallel arrays
        const getAssociations = (indicator) => {
          const coiList = indicator.chantier_ou_impact_list;
          const sectorList = indicator.sector_list;
          if (Array.isArray(coiList) && coiList.length) {
            return coiList.map((coi, i) => ({
              chantierOuImpact: coi || 'Autre',
              sector: (Array.isArray(sectorList) && sectorList[i]) || indicator.sector || 'Synthèse'
            }));
          }
          return [{
            chantierOuImpact: indicator.chantier_ou_impact || 'Autre',
            sector: indicator.sector || 'Synthèse'
          }];
        };

        data.forEach(indicator => {
          const levier = indicator.levier || '';
          const associations = getAssociations(indicator);

          associations.forEach(({ chantierOuImpact, sector }) => {
            const axeName =
              canonicalImpactAxeNomComplet(chantierOuImpact || '') ||
              normalizeImpactAxeName(chantierOuImpact || 'Autre') ||
              'Autre';

            // "Indicateur d'impact - autres" can appear in a composite levier string,
            // so we check using includes instead of strict equality.
            if (levier && levier.includes("Indicateur d'impact - autres")) {
              // Group by chantier name (chantier_ou_impact); displayed under chantier title, no submenu
              const key = `${axeName}:::${indicator.label_indic}`;
              if (!seenByChantierAutres.has(key)) {
                seenByChantierAutres.add(key);
                if (!chantierAutresGroups[axeName]) chantierAutresGroups[axeName] = [];
                chantierAutresGroups[axeName].push(indicator);
              }
            } else {
              // Group by taxonomy axe (chantier_ou_impact)
              // This includes both "Indicateur d'impact" and "Autres indicateurs"
              const key = `${axeName}:::${indicator.label_indic}`;
              if (!seenByAxe.has(key)) {
                seenByAxe.add(key);
                if (!axeGroups[axeName]) axeGroups[axeName] = [];
                axeGroups[axeName].push(indicator);
              }

              // For "Indicateur d'impact" only: also group by sector (for sector sections in axe detail)
              if (levier && levier.includes("Indicateur d'impact") && !levier.includes("Indicateur d'impact - autres")) {
                const sectorKey = `${axeName}:::${sector}:::${indicator.label_indic}`;
                if (!seenByAxeSector.has(sectorKey)) {
                  seenByAxeSector.add(sectorKey);
                  if (!axeAndSectorGroups[axeName]) axeAndSectorGroups[axeName] = {};
                  if (!axeAndSectorGroups[axeName][sector]) axeAndSectorGroups[axeName][sector] = [];
                  axeAndSectorGroups[axeName][sector].push(indicator);
                }
              }
            }
          });
        });

        this.engagementsByAxe = axeGroups;
        this.engagementsByChantierAutres = chantierAutresGroups;
        this.engagementsByAxeAndSector = axeAndSectorGroups;
      } catch (error) {
        console.error("Error grouping engagements by axe:", error);
        this.engagementsByAxe = {};
        this.engagementsByChantierAutres = {};
        this.engagementsByAxeAndSector = {};
      }
    },
    goAccueil() {
      const isStaging = window.location.pathname.includes('/staging')
      this.$router.push({ name: homeRouteName(isStaging) }).catch(() => {})
    },
    goEtatEnvironnement() {
      const isStaging = window.location.pathname.includes('/staging')
      this.$router.push({
        name: etatEnvironnementRouteName(isStaging),
        query: { section: SECTION_SYNTHESE_SLUG }
      }).catch(() => {})
    },
    getIndicatorSectionId(prefix, index) {
      const safePrefix = String(prefix || '').replace(/[^a-zA-Z0-9-]/g, '-').replace(/-+/g, '-') || 'impact';
      return `section-indicateur-${safePrefix}-${index}`;
    },
    getSectorSectionId(sector) {
      const safe = String(sector || '').replace(/[^a-zA-Z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'secteur';
      return `section-secteur-${safe}`;
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

.section-header {
  margin-bottom: 1.5rem;
}

.fr-h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.fr-h4 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

/* Axe detail view: same look and feel as ChantierDetail */
.axe-detail a {
  background-image: none;
}

.axe-detail .fr-breadcrumb {
  margin-bottom: 0;
}

.axe-detail .fr-breadcrumb__list {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.75rem;
  color: #666;
}

.axe-detail .fr-breadcrumb__list li::before {
  content: '>';
  margin-right: 0.5rem;
}

.axe-detail .fr-breadcrumb__list li:first-child::before {
  content: '';
  margin-right: 0;
}

.axe-detail .fr-breadcrumb__link {
  color: #000091;
  text-decoration: underline;
  text-underline-offset: 2px;
  font-size: 0.75rem;
}

.axe-detail .fr-breadcrumb__link[aria-current] {
  color: #3a3a3a;
  text-decoration: none;
}

.axe-hero {
  background: transparent;
  border-bottom: 1px solid #d6d6d6;
  padding: 0 0 1rem;
}

.axe-title {
  margin-bottom: 0.75rem;
  max-width: 54rem;
}

/* Indicateurs / Leviers tags - même thème que ChantierDetail */
.chantier-metadata-tags {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  margin-top: 0.75rem;
}

.chantier-tags-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.25rem 0.5rem;
}

.chantier-tags-row__label {
  color: #3a3a3a;
  font-size: 0.75rem;
  font-weight: 400;
  flex-shrink: 0;
}

.chantier-metadata-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  border-radius: 999px;
  font-size: 0.5625rem;
  font-weight: 400;
  line-height: 1.3;
  padding: 0.15rem 0.4rem;
  text-decoration: none;
  transition: background-color 0.15s, color 0.15s;
}

.chantier-metadata-tag__icon {
  font-size: 0.75rem;
  flex-shrink: 0;
}

/* Indicateurs - light cyan */
.chantier-metadata-tag--indicateur {
  background: #c7f6fc;
  color: #000091;
}

.chantier-metadata-tag--indicateur .chantier-metadata-tag__icon {
  color: #000091;
}

.chantier-metadata-tag--indicateur:hover,
.chantier-metadata-tag--indicateur:focus {
  background: #000091;
  color: #fff;
}

.chantier-metadata-tag--indicateur:hover .chantier-metadata-tag__icon,
.chantier-metadata-tag--indicateur:focus .chantier-metadata-tag__icon {
  color: inherit;
}

/* Leviers - light purple */
.chantier-metadata-tag--levier {
  background: #e8e0f7;
  color: #000091;
}

.chantier-metadata-tag--levier .chantier-metadata-tag__icon {
  color: #000091;
}

.chantier-metadata-tag--levier:hover,
.chantier-metadata-tag--levier:focus {
  background: #000091;
  color: #fff;
}

.chantier-metadata-tag--levier:hover .chantier-metadata-tag__icon,
.chantier-metadata-tag--levier:focus .chantier-metadata-tag__icon {
  color: inherit;
}

.axe-summary {
  background: #f6f6f6;
  border-left: 4px solid #6a6af4;
  padding: 1.25rem 1.5rem;
}

.axe-section {
  padding: 1.25rem 0;
  scroll-margin-top: 1.5rem;
}

.axe-indicator-card {
  scroll-margin-top: 1.5rem;
}

.axe-section--highlighted {
  border-top: none;
}

.axe-section-title {
  margin-top: 0;
  margin-bottom: 0.75rem;
}

.axe-summary-copy {
  color: #3a3a3a;
  margin-bottom: 0;
}

.levier-title {
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #d6d6d6;
}

.axe-empty-state,
.axe-state p {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .axe-summary,
  .axe-section {
    padding: 1rem;
  }

  .chantier-metadata-tags {
    gap: 0.625rem;
  }

  .chantier-tags-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .chantier-metadata-tag {
    font-size: 0.5rem;
    padding: 0.15rem 0.4rem;
  }
}
</style>
