<template>
  <nav role="navigation" class="fr-sidemenu fr-sidemenu__padding"
    aria-label="Navigation des volets">
    <div class="fr-sidemenu__inner">
      <button class="fr-sidemenu__btn" aria-controls="fr-sidemenu-wrapper" aria-expanded="false">
        Navigation
      </button>
      <div class="fr-collapse" id="fr-sidemenu-wrapper">
        <ul class="fr-sidemenu__list">
          <!-- État de l'environnement (route / tableau de bord, secteur Synthèse uniquement) -->
          <template v-if="sector === 'Synthèse' && isEtatEnvironnementContext">
            <li class="fr-sidemenu__item">
              <a class="fr-sidemenu__link"
                title="Synthèse"
                @click="set_etat_environnement"
                target="_self"
                :aria-current="currentView === 'etat-environnement' ? 'page' : undefined"
                tabindex="0"
              >
                Synthèse
              </a>
            </li>
            <li class="fr-sidemenu__item" v-for="axe in displayedTaxonomyAxes" :key="'axe-' + axe">
              <a class="fr-sidemenu__link"
                :title="axe"
                @click="set_general_engagements(axe)"
                target="_self"
                :aria-current="currentView === 'general-engagements' && axesMatch(currentAxe, axe) ? 'page' : undefined"
                tabindex="0"
              >
                {{ impactAxeNomCourt(axe) }}
              </a>
            </li>
          </template>

          <!-- Chantiers sectoriels : accordéon Synthèse + secteurs (toujours sur la route /chantiers) -->
          <template v-else-if="showChantiersAccordionSidebar">
            <li class="fr-sidemenu__item">
              <a class="fr-sidemenu__link"
                title="Synthèse"
                @click="set_chantiers_sectoriels"
                target="_self"
                :aria-current="currentView === 'chantiers-sectoriels' ? 'page' : undefined"
                tabindex="0"
              >
                Synthèse
              </a>
            </li>

            <li class="fr-sidemenu__item" v-for="sectorName in chantierSectors" :key="sectorName">
              <button
                class="fr-sidemenu__btn"
                :class="{ 'sidemenu-btn--active': expandedSectorName === sectorName }"
                :aria-expanded="expandedSectorName === sectorName"
                @click="toggleSector(sectorName)"
              >
                {{ sectorName }}
              </button>
              <div
                class="fr-collapse sidemenu-chantiers-expanded"
                :class="{ 'fr-collapse--expanded': expandedSectorName === sectorName }"
              >
                <ul class="fr-sidemenu__list">
                  <li class="fr-sidemenu__item" v-for="chantier in getSectorChantiers(sectorName)" :key="chantier.id">
                    <a class="fr-sidemenu__link"
                      :title="chantier.name"
                      @click="set_chantier_from_synthese(sectorName, chantier)"
                      target="_self"
                      :aria-current="currentView === 'chantier' && currentChantierId === chantier.id ? 'page' : undefined"
                      tabindex="0"
                    >
                      {{ chantier.name }}
                    </a>
                  </li>
                </ul>
              </div>
            </li>
          </template>

          <!-- Tableau de bord par secteur (hors route /chantiers) -->
          <template v-else>
            <li class="fr-sidemenu__item">
                  <a class="fr-sidemenu__link" 
                title="Indicateurs d'impact"
                @click="set_sectorial_engagements"
                    target="_self"
                :aria-current="currentView === 'sectorial-engagements'"
                    tabindex="0"
                v-on:keyup.enter="set_sectorial_engagements"
                  >
                Indicateurs d'impact
                  </a>
                </li>
            <!-- Chantiers du secteur (pas de doublon avec l’onglet « Chantiers sectoriels » ni aria-current sur le titre) -->
            <li class="fr-sidemenu__item">
              <span class="fr-sidemenu__link sidemenu-section-title">
                Chantiers
              </span>
              <div class="fr-collapse fr-collapse--expanded sidemenu-chantiers-expanded">
                <ul class="fr-sidemenu__list">
                  <li class="fr-sidemenu__item" v-for="(chantier, index) in chantiers" :key="index">
                    <a class="fr-sidemenu__link" 
                      :title="chantier.name"
                      @click="set_chantier(chantier)"
                      target="_self"
                      :aria-current="currentView === 'chantier' && currentChantierId === chantier.id"
                      tabindex="0"
                      v-on:keyup.enter="set_chantier(chantier)"
                    >
                      {{ chantier.name }}
                    </a>
                  </li>
                </ul>
              </div>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>
<script>
import {
  getNavigationStructure,
  IMPACT_AXE_DISPLAY_ORDER,
  isImpactAxe,
  impactAxeNomCourt as impactAxeNomCourtFromTaxonomy,
  resolveSyntheseImpactGroupingKey,
} from "@/services/csvDataService.js";

export default {
  name: "SideNavigation",
  data() {
    return {
      chantiers: [],
      currentView: null,
      currentChantierId: null,
      currentAxe: null,
      currentSectorFilter: null,
      taxonomyAxes: [],
      chantierSectors: [],
      expandedIndicateurs: false,
      expandedChantiers: false,
      expandedSectorName: null, // On synthèse/chantiers-sectoriels: start with all collapsed
      allSectorChantiers: {},
      navigationData: null,  // Store the full navigation structure
      isLoading: true,
    };
  },
  computed: {
    isEtatEnvironnementContext() {
      const etatViews = ['etat-environnement', 'general-engagements', 'engagements-table'];
      return etatViews.includes(this.currentView);
    },
    displayedTaxonomyAxes() {
      const axes = Array.isArray(this.taxonomyAxes) ? [...this.taxonomyAxes] : [];
      const axesSet = new Set(axes);
      const adaptationComplet = IMPACT_AXE_DISPLAY_ORDER.find(
        (n) => /adaptation/i.test(n) && /climat/i.test(n)
      );
      return IMPACT_AXE_DISPLAY_ORDER.filter(
        (axe) => axesSet.has(axe) || (adaptationComplet && axe === adaptationComplet)
      );
    },
    /** Route dédiée Chantiers : accordéon secteurs même si `section` ≠ synthese */
    isChantiersShellRoute() {
      const n = this.$route && this.$route.name;
      return n === "chantiers" || n === "staging-chantiers";
    },
    showChantiersAccordionSidebar() {
      if (this.isEtatEnvironnementContext) return false;
      return this.sector === "Synthèse" || this.isChantiersShellRoute;
    },
  },
  props: {
    initParams: {
      type: Object,
    },
    useStaging: {
      type: Boolean,
      default: false
    },
    sector: {
      type: String,
      default: 'Synthèse'
    }
  },
  methods: {
    async loadChantiers() {
      // Load navigation structure from Grist data
      try {
        this.isLoading = true;
        const environment = this.useStaging ? 'staging' : 'production';
        const response = await getNavigationStructure(environment);
        
        if (response.status === 'success') {
          this.navigationData = response.data;
          
          // Get data for current sector
          const sectorData = response.data.sectors.find(s => s.name === this.sector);
          
          if (sectorData) {
            // Build chantiers list from the navigation data
            this.chantiers = Object.entries(sectorData.chantiers)
              // Exclude impact axes from sectorial "Chantiers sectoriels" navigation
              .filter(([name]) => !isImpactAxe(name))
              .map(([name, chantierData]) => ({
                id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                name: name,
                sortedLeviers: chantierData.sortedLeviers || [],
                descriptionChantier: chantierData.descriptionChantier || '',
                axeTaxonomie: chantierData.axeTaxonomie || [],
                // Collect all grist IDs from all leviers
                grist_ids: Object.values(chantierData.leviers)
                  .flat()
                  .map(item => item.gristId)
                  .filter(id => id)
              }));
          } else {
            this.chantiers = [];
          }

          // Accordéon chantiers : axes (Synthèse) + liste multi-secteurs
          if (this.sector === "Synthèse") {
            this.loadTaxonomyAxes();
          }
          if (this.sector === "Synthèse" || this.isChantiersShellRoute) {
            this.loadChantierSectors();
            this.loadAllSectorChantiers();
          }
        }
        
        this.isLoading = false;

        // Initialize with view from initParams, or default view based on sector
        if (!this.initParams || !this.initParams.view) {
          // No view specified - use default for sector
          if (this.sector === "Synthèse" || this.isChantiersShellRoute) {
            this.set_chantiers_sectoriels();
          } else {
            this.set_sectorial_engagements();
          }
        } else if (this.initParams.view === 'etat-environnement') {
          if (this.sector === 'Synthèse') {
            this.set_etat_environnement();
          } else {
            this.set_sectorial_engagements();
          }
        } else if (this.initParams.view === 'chantiers-sectoriels') {
          if (this.sector === "Synthèse" || this.isChantiersShellRoute) {
            this.set_chantiers_sectoriels();
          } else {
            this.set_sectorial_engagements();
          }
        } else if (this.initParams.view === 'about') {
          // Only valid for Synthèse sector
          if (this.sector === 'Synthèse') {
            this.set_about();
          } else {
            this.set_sectorial_engagements();
          }
        } else if (this.initParams.view === 'engagements-table') {
          // Only valid for Synthèse sector
          if (this.sector === 'Synthèse') {
            this.set_engagements_table();
            this.expandedIndicateurs = true;
          } else {
            this.set_sectorial_engagements();
          }
        } else if (this.initParams.view === 'chantiers-table') {
          if (this.sector === "Synthèse" || this.isChantiersShellRoute) {
            this.set_chantiers_table();
            this.expandedChantiers = true;
          } else {
            this.set_sectorial_engagements();
          }
        } else if (this.initParams.view === 'chantier' && this.initParams.chantier_id) {
          if (this.sector === 'Synthèse') {
            // On Synthèse: look through all sector chantiers
            const chantierSector = this.initParams.chantier_sector || null;
            let foundChantier = null;
            let foundSector = null;

            if (chantierSector && this.allSectorChantiers[chantierSector]) {
              foundChantier = this.allSectorChantiers[chantierSector].find(c => c.id === this.initParams.chantier_id);
              foundSector = chantierSector;
            }
            // If not found by sector hint, search all
            if (!foundChantier) {
              for (const [secName, chantiers] of Object.entries(this.allSectorChantiers)) {
                const match = chantiers.find(c => c.id === this.initParams.chantier_id);
                if (match) {
                  foundChantier = match;
                  foundSector = secName;
                  break;
                }
              }
            }

            if (foundChantier && foundSector) {
              this.set_chantier_from_synthese(foundSector, foundChantier);
            } else {
              const hint = this.initParams.chantier_sector;
              const hintList =
                hint && this.allSectorChantiers[hint]
                  ? this.allSectorChantiers[hint]
                  : null;
              if (hintList && hintList.length > 0) {
                this.set_chantier_from_synthese(hint, hintList[0]);
              } else {
                let fallbackSector = null;
                let fallbackChantier = null;
                for (const secName of this.chantierSectors) {
                  const list = this.allSectorChantiers[secName];
                  if (list && list.length > 0) {
                    fallbackSector = secName;
                    fallbackChantier = list[0];
                    break;
                  }
                }
                if (fallbackSector && fallbackChantier) {
                  this.set_chantier_from_synthese(
                    fallbackSector,
                    fallbackChantier
                  );
                } else {
                  this.set_chantiers_sectoriels();
                }
              }
            }
          } else if (this.isChantiersShellRoute) {
            const chantier = this.chantiers.find(
              (c) => c.id === this.initParams.chantier_id
            );
            if (chantier) {
              this.set_chantier_from_synthese(this.sector, chantier);
            } else if (this.chantiers.length > 0) {
              this.set_chantier_from_synthese(this.sector, this.chantiers[0]);
            } else {
              this.set_chantiers_sectoriels();
            }
          } else {
            // Tableau de bord secteur : liste plate
            const chantier = this.chantiers.find(
              (c) => c.id === this.initParams.chantier_id
            );
            if (chantier) {
              this.set_chantier(chantier);
            } else if (this.chantiers.length > 0) {
              this.set_chantier(this.chantiers[0]);
            } else {
              this.set_sectorial_engagements();
            }
          }
        } else if (this.initParams.view === 'general-engagements') {
          // Only valid for Synthèse sector
          if (this.sector === 'Synthèse') {
            const axe = this.initParams.axe || null;
            this.set_general_engagements(axe);
            if (axe) this.expandedIndicateurs = true;
          } else {
            // Invalid view for this sector - use default
            this.set_sectorial_engagements();
          }
        } else if (this.initParams.view === 'general-chantiers') {
          if (this.sector === "Synthèse" || this.isChantiersShellRoute) {
            const sectorFilter = this.initParams.sectorFilter || null;
            this.set_general_chantiers(sectorFilter);
            if (sectorFilter) this.expandedChantiers = true;
          } else {
            this.set_sectorial_engagements();
          }
        } else if (this.initParams.view === 'sectorial-engagements') {
          if (this.sector === "Synthèse" || this.isChantiersShellRoute) {
            this.set_chantiers_sectoriels();
          } else {
            this.set_sectorial_engagements();
          }
        } else {
          if (this.sector === "Synthèse" || this.isChantiersShellRoute) {
            this.set_chantiers_sectoriels();
          } else {
            this.set_sectorial_engagements();
          }
        }
        this.emitNextSectionMeta();
      } catch (error) {
        console.error("Error loading chantiers:", error);
        this.chantiers = [];
        this.isLoading = false;
        this.emitNextSectionMeta();
      }
    },
    loadTaxonomyAxes() {
      try {
        if (!this.navigationData) return;
        
        // Get the Synthèse sector data
        const syntheseSector = this.navigationData.sectors.find(s => s.name === 'Synthèse');
        if (!syntheseSector || !syntheseSector.indicateursImpact) return;
        
        // Get unique taxonomy axes from indicateursImpact (which are grouped by axe)
        this.taxonomyAxes = Object.keys(syntheseSector.indicateursImpact)
          .filter(axe => axe && axe !== 'Autre')
          .sort();
      } catch (error) {
        console.error("Error loading taxonomy axes:", error);
        this.taxonomyAxes = [];
      }
    },
    loadChantierSectors() {
      try {
        if (!this.navigationData) return;
        
        // Get sectors that have chantiers (excluding Synthèse), sorted alphabetically
        const sectorsWithChantiers = this.navigationData.sectors
          .filter(s => s.name !== 'Synthèse' && Object.keys(s.chantiers).length > 0)
          .map(s => s.name)
          .sort((a, b) => a.localeCompare(b, 'fr'));
        
        this.chantierSectors = sectorsWithChantiers;
      } catch (error) {
        console.error("Error loading chantier sectors:", error);
        this.chantierSectors = [];
      }
    },
    loadAllSectorChantiers() {
      try {
        if (!this.navigationData) return;

        const result = {};
        this.navigationData.sectors
          .filter(s => s.name !== 'Synthèse')
          .forEach(sector => {
            result[sector.name] = Object.entries(sector.chantiers)
              .filter(([name]) => !isImpactAxe(name))
              .map(([name, chantierData]) => ({
                id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                name: name,
                sortedLeviers: chantierData.sortedLeviers || [],
                descriptionChantier: chantierData.descriptionChantier || '',
                axeTaxonomie: chantierData.axeTaxonomie || [],
                grist_ids: Object.values(chantierData.leviers)
                  .flat()
                  .map(item => item.gristId)
                  .filter(id => id)
              }));
          });

        this.allSectorChantiers = result;
      } catch (error) {
        console.error("Error loading all sector chantiers:", error);
        this.allSectorChantiers = {};
      }
    },
    axesMatch(a, b) {
      if (!a || !b) return a === b;
      return a === b || (a === 'Économie circulaire' && b === 'Economie circulaire');
    },
    impactAxeNomCourt(nomComplet) {
      return impactAxeNomCourtFromTaxonomy(nomComplet);
    },
    toggleIndicateurs() {
      this.expandedIndicateurs = !this.expandedIndicateurs;
    },
    toggleChantiers() {
      this.expandedChantiers = !this.expandedChantiers;
    },
    toggleSector(sectorName) {
      this.expandedSectorName = this.expandedSectorName === sectorName ? null : sectorName;
    },
    getSectorChantiers(sectorName) {
      return this.allSectorChantiers[sectorName] || [];
    },
    set_etat_environnement() {
      this.currentView = 'etat-environnement';
      this.currentChantierId = null;
      this.currentAxe = null;
      this.currentSectorFilter = null;

      const params = {
        view: 'etat-environnement',
        label: 'Etat de l\'environnement',
        sector: 'Synthèse',
      };
      this.$emit("params", params);
    },
    set_chantiers_sectoriels() {
      this.currentView = 'chantiers-sectoriels';
      this.currentChantierId = null;
      this.currentAxe = null;
      this.currentSectorFilter = null;
      this.expandedSectorName = null; // All sectors collapsed on synthèse

      const params = {
        view: 'chantiers-sectoriels',
        label: 'Synthèse des chantiers sectoriels',
        sector: 'Synthèse',
      };
      this.$emit("params", params);
    },
    set_chantier_from_synthese(sectorName, chantier) {
      // Navigate to a chantier while staying inside Synthèse sector
      // The chantier's real sector is passed as chantier_sector for display (breadcrumb etc.)
      this.currentView = 'chantier';
      this.currentChantierId = chantier.id;
      this.expandedSectorName = sectorName;

      const gristIds = chantier.grist_ids || [];

      const params = {
        view: 'chantier',
        chantier_id: chantier.id,
        chantier_name: chantier.name,
        label: chantier.name,
        sector: 'Synthèse',          // Keep Synthèse as the URL sector
        chantier_sector: sectorName,  // Real sector for display purposes
        grist_ids: gristIds,
        query: {
          filter_by: [
            { field: "grist_ids", values: gristIds },
          ],
          time_period: {
            date_start: "2015-01-01",
            date_end: "2031-01-01",
          },
        },
        sortedLeviers: chantier.sortedLeviers || [],
        descriptionChantier: chantier.descriptionChantier || '',
        axeTaxonomie: chantier.axeTaxonomie || [],
      };
      this.$emit("params", params);
    },
    set_about() {
      this.currentView = 'about';
      this.currentChantierId = null;
      this.currentAxe = null;
      this.currentSectorFilter = null;
      
      const params = {
        view: 'about',
        label: 'À propos',
        sector: 'Synthèse',
      };
      this.$emit("params", params);
    },
    set_engagements_table() {
      this.currentView = 'engagements-table';
      this.currentChantierId = null;
      this.currentAxe = null;
      this.currentSectorFilter = null;
      
      try {
        // Get all impact indicator grist IDs for Synthèse sector (indicateursImpact + indicateursImpactAutresByChantier)
        const engagementIds = [];
        if (this.navigationData) {
          const syntheseSector = this.navigationData.sectors.find(s => s.name === 'Synthèse');
          if (syntheseSector) {
            if (syntheseSector.indicateursImpact) {
              Object.values(syntheseSector.indicateursImpact).forEach(indicators => {
                indicators.forEach(item => {
                  if (item.gristId) engagementIds.push(item.gristId);
                });
              });
            }
            if (syntheseSector.indicateursImpactAutresByChantier) {
              Object.values(syntheseSector.indicateursImpactAutresByChantier).forEach(indicators => {
                indicators.forEach(item => {
                  if (item.gristId) engagementIds.push(item.gristId);
                });
              });
            }
          }
        }
      
        const params = {
          view: 'engagements-table',
          label: 'Tableau de synthèse - Indicateurs d\'impact',
          sector: 'Synthèse',
          query: {
            filter_by: [
              { field: "grist_ids", values: engagementIds },
            ],
            time_period: {
              date_start: "2015-01-01",
              date_end: "2031-01-01",
            },
          },
        };
        this.$emit("params", params);
      } catch (error) {
        console.error("Error setting engagements table view:", error);
      }
    },
    set_chantiers_table() {
      this.currentView = 'chantiers-table';
      this.currentChantierId = null;
      this.currentAxe = null;
      this.currentSectorFilter = null;
      
      try {
        // Get only "Indicateur de chantier" grist IDs (excluding Synthèse sector)
        const chantierIds = [];
        if (this.navigationData) {
          this.navigationData.sectors
            .filter(s => s.name !== 'Synthèse')
            .forEach(sector => {
              Object.values(sector.chantiers).forEach(chantier => {
                // Only get "Indicateur de chantier" leviers
                const chantierLevelIndicators = chantier.leviers['Indicateur de chantier'] || [];
                chantierLevelIndicators.forEach(item => {
                  if (item.gristId) {
                    chantierIds.push(item.gristId);
                  }
                });
              });
            });
        }
      
        const params = {
          view: 'chantiers-table',
          label: 'Tableau de synthèse - Chantiers',
          sector: 'Synthèse',
          query: {
            filter_by: [
              { field: "grist_ids", values: chantierIds },
            ],
            time_period: {
              date_start: "2015-01-01",
              date_end: "2031-01-01",
            },
          },
        };
        this.$emit("params", params);
      } catch (error) {
        console.error("Error setting chantiers table view:", error);
      }
    },
    set_general_engagements(axe = null) {
      this.currentView = 'general-engagements';
      this.currentChantierId = null;
      this.currentAxe = axe;
      this.currentSectorFilter = null;
      
      try {
        // Get impact indicator grist IDs for Synthèse sector, optionally filtered by axe (no submenu for "Indicateur d'impact - autres")
        const engagementIds = [];
        
        if (this.navigationData) {
          const syntheseSector = this.navigationData.sectors.find(s => s.name === 'Synthèse');
          if (syntheseSector) {
            if (axe) {
              // Filter by specific axe (axes only; "Indicateur d'impact - autres" has no submenu)
              // Normalize Economie circulaire / Économie circulaire
              const axeKey = axe === 'Économie circulaire' && !syntheseSector.indicateursImpact?.[axe]
                ? 'Economie circulaire'
                : axe;
              // Indicateurs d'impact : Synthèse + tous les secteurs (Préserver, Consommer, Se déplacer, etc.)
              this.navigationData.sectors.forEach(sector => {
                const indicators = sector.indicateursImpact?.[axeKey] || sector.indicateursImpact?.[axe] || [];
                indicators.forEach(item => {
                  if (item.gristId) engagementIds.push(item.gristId);
                });
              });
              
              const autresBucketKey = resolveSyntheseImpactGroupingKey(
                syntheseSector.chantiers,
                axeKey
              );
              if (autresBucketKey) {
                const autresIndicateurs =
                  syntheseSector.chantiers[autresBucketKey].leviers?.["Autres indicateurs"] || [];
                autresIndicateurs.forEach(item => {
                  if (item.gristId) engagementIds.push(item.gristId);
                });
              }
            } else {
              // Get all impact indicators (axes + indicateursImpactAutresByChantier)
              if (syntheseSector.indicateursImpact) {
                Object.values(syntheseSector.indicateursImpact).forEach(indicators => {
                  indicators.forEach(item => {
                    if (item.gristId) engagementIds.push(item.gristId);
                  });
                });
              }
              if (syntheseSector.indicateursImpactAutresByChantier) {
                Object.values(syntheseSector.indicateursImpactAutresByChantier).forEach(indicators => {
                  indicators.forEach(item => {
                    if (item.gristId) engagementIds.push(item.gristId);
                  });
                });
              }
              
              // Also include "Autres indicateurs" from chantiers when chantier name is a taxonomy axe
              if (syntheseSector.chantiers) {
                Object.entries(syntheseSector.chantiers).forEach(([chantierName, chantier]) => {
                  if (isImpactAxe(chantierName) && chantier.leviers?.["Autres indicateurs"]) {
                    chantier.leviers["Autres indicateurs"].forEach(item => {
                      if (item.gristId) engagementIds.push(item.gristId);
                    });
                  }
                });
              }
            }
          }
        }
      
        const params = {
          view: 'general-engagements',
          label: axe ? impactAxeNomCourtFromTaxonomy(axe) : 'Indicateurs d\'impact',
          sector: 'Synthèse',
          axe: axe,
          query: {
            filter_by: [
              { field: "grist_ids", values: engagementIds },
            ],
            time_period: {
              date_start: "2015-01-01",
              date_end: "2031-01-01",
            },
          },
        };
        this.$emit("params", params);
      } catch (error) {
        console.error("Error setting general engagements view:", error);
      }
    },
    set_general_chantiers(sectorFilter = null) {
      this.currentView = 'general-chantiers';
      this.currentChantierId = null;
      this.currentAxe = null;
      this.currentSectorFilter = sectorFilter;
      
      try {
        // Get only "Indicateur de chantier" grist IDs, optionally filtered by sector
        const chantierIds = [];
        if (this.navigationData) {
          const sectorsToInclude = sectorFilter 
            ? this.navigationData.sectors.filter(s => s.name === sectorFilter)
            : this.navigationData.sectors.filter(s => s.name !== 'Synthèse');
          
          sectorsToInclude.forEach(sector => {
            Object.values(sector.chantiers).forEach(chantier => {
              // Only get "Indicateur de chantier" leviers
              const chantierLevelIndicators = chantier.leviers['Indicateur de chantier'] || [];
              chantierLevelIndicators.forEach(item => {
                if (item.gristId) chantierIds.push(item.gristId);
              });
            });
          });
        }
      
        const params = {
          view: 'general-chantiers',
          label: sectorFilter ? sectorFilter : 'Chantiers',
          sector: 'Synthèse',
          sectorFilter: sectorFilter,
          query: {
            filter_by: [
              { field: "grist_ids", values: chantierIds },
            ],
            time_period: {
              date_start: "2015-01-01",
              date_end: "2031-01-01",
            },
          },
        };
        this.$emit("params", params);
      } catch (error) {
        console.error("Error setting general chantiers view:", error);
      }
    },
    set_sectorial_engagements() {
      this.currentView = 'sectorial-engagements';
      this.currentChantierId = null;
      
      try {
        // Get all impact indicator grist IDs for current sector (indicateursImpact + indicateursImpactAutresByChantier)
        const engagementIds = [];
        if (this.navigationData) {
          const sectorData = this.navigationData.sectors.find(s => s.name === this.sector);
          if (sectorData) {
            if (sectorData.indicateursImpact) {
              Object.values(sectorData.indicateursImpact).forEach(indicators => {
                indicators.forEach(item => {
                  if (item.gristId) engagementIds.push(item.gristId);
                });
              });
            }
            if (sectorData.indicateursImpactAutresByChantier) {
              Object.values(sectorData.indicateursImpactAutresByChantier).forEach(indicators => {
                indicators.forEach(item => {
                  if (item.gristId) engagementIds.push(item.gristId);
                });
              });
            }
          }
        }
      
        const params = {
          view: 'sectorial-engagements',
          label: 'Indicateurs d\'impact',
          sector: this.sector,
          query: {
            filter_by: [
              { field: "grist_ids", values: engagementIds },
            ],
            time_period: {
              date_start: "2015-01-01",
              date_end: "2031-01-01",
            },
          },
        };
        this.$emit("params", params);
      } catch (error) {
        console.error("Error setting sectorial engagements view:", error);
      }
    },
    _buildEtatSidebarSequence() {
      const seq = [
        {
          label: 'Synthèse',
          apply: () => this.set_etat_environnement(),
        },
      ];
      for (const axe of this.displayedTaxonomyAxes) {
        seq.push({
          label: this.impactAxeNomCourt(axe),
          apply: () => this.set_general_engagements(axe),
        });
      }
      return seq;
    },
    _currentEtatSidebarIndex() {
      if (this.currentView === 'etat-environnement') return 0;
      if (this.currentView === 'engagements-table') return -2;
      if (this.currentView === 'general-engagements') {
        if (!this.currentAxe) return 0;
        const i = this.displayedTaxonomyAxes.findIndex((a) =>
          this.axesMatch(this.currentAxe, a)
        );
        return i >= 0 ? i + 1 : 0;
      }
      return -1;
    },
    _resolveNextEtatStep() {
      const valid = ['etat-environnement', 'general-engagements', 'engagements-table'];
      if (!valid.includes(this.currentView)) return null;
      const seq = this._buildEtatSidebarSequence();
      if (seq.length < 2) return null;
      const idx = this._currentEtatSidebarIndex();
      if (idx === -2) {
        return seq[1];
      }
      if (idx >= 0 && idx < seq.length - 1) {
        return seq[idx + 1];
      }
      return null;
    },
    _buildChantiersAccordionSequence() {
      const seq = [
        {
          label: 'Synthèse des chantiers sectoriels',
          apply: () => this.set_chantiers_sectoriels(),
        },
      ];
      for (const sectorName of this.chantierSectors) {
        for (const ch of this.getSectorChantiers(sectorName)) {
          seq.push({
            label: ch.name,
            apply: () => this.set_chantier_from_synthese(sectorName, ch),
          });
        }
      }
      return seq;
    },
    _currentChantiersAccordionIndex() {
      if (this.currentView === 'chantiers-sectoriels') return 0;
      if (this.currentView === 'chantiers-table' || this.currentView === 'general-chantiers') {
        return -2;
      }
      if (this.currentView === 'chantier' && this.currentChantierId) {
        let idx = 1;
        for (const sn of this.chantierSectors) {
          for (const ch of this.getSectorChantiers(sn)) {
            if (ch.id === this.currentChantierId) return idx;
            idx += 1;
          }
        }
      }
      return -1;
    },
    _resolveNextChantiersAccordionStep() {
      const valid = [
        'chantiers-sectoriels',
        'chantier',
        'chantiers-table',
        'general-chantiers',
      ];
      if (!valid.includes(this.currentView)) return null;
      const seq = this._buildChantiersAccordionSequence();
      if (seq.length < 2) return null;
      const idx = this._currentChantiersAccordionIndex();
      if (idx === -2) {
        return seq[1];
      }
      if (idx >= 0 && idx < seq.length - 1) {
        return seq[idx + 1];
      }
      return null;
    },
    _buildSectorDashboardSequence() {
      const seq = [
        {
          label: "Indicateurs d'impact",
          apply: () => this.set_sectorial_engagements(),
        },
      ];
      for (const ch of this.chantiers) {
        seq.push({
          label: ch.name,
          apply: () => this.set_chantier(ch),
        });
      }
      return seq;
    },
    _currentSectorDashboardIndex() {
      if (this.currentView === 'sectorial-engagements') return 0;
      if (this.currentView === 'chantier' && this.currentChantierId) {
        const i = this.chantiers.findIndex((c) => c.id === this.currentChantierId);
        return i >= 0 ? i + 1 : -1;
      }
      return -1;
    },
    _resolveNextSectorDashboardStep() {
      const valid = ['sectorial-engagements', 'chantier'];
      if (!valid.includes(this.currentView)) return null;
      const seq = this._buildSectorDashboardSequence();
      if (seq.length < 2) return null;
      const idx = this._currentSectorDashboardIndex();
      if (idx >= 0 && idx < seq.length - 1) {
        return seq[idx + 1];
      }
      return null;
    },
    /** Prochaine entrée du menu latéral (même ordre que les liens affichés). */
    _resolveNextSidebarStep() {
      if (this.isLoading) return null;
      if (this.sector === 'Synthèse' && this.isEtatEnvironnementContext) {
        return this._resolveNextEtatStep();
      }
      if (this.showChantiersAccordionSidebar) {
        return this._resolveNextChantiersAccordionStep();
      }
      return this._resolveNextSectorDashboardStep();
    },
    computeNextSectionMeta() {
      const step = this._resolveNextSidebarStep();
      if (!step) return { label: null, enabled: false };
      return { label: step.label, enabled: true };
    },
    goToNextSection() {
      const step = this._resolveNextSidebarStep();
      if (step && typeof step.apply === 'function') {
        step.apply();
      }
    },
    emitNextSectionMeta() {
      this.$nextTick(() => {
        this.$emit('next-section-meta', this.computeNextSectionMeta());
      });
    },
    set_chantier(chantier) {
      this.currentView = 'chantier';
      this.currentChantierId = chantier.id;
      
      const gristIds = chantier.grist_ids || [];
      
      const params = {
        view: 'chantier',
        chantier_id: chantier.id,
        chantier_name: chantier.name,
        label: chantier.name,
        sector: this.sector,
        grist_ids: gristIds, // Pass grist_ids directly for ChantierDetail
        query: {
          filter_by: [
            { field: "grist_ids", values: gristIds },
          ],
          time_period: {
            date_start: "2015-01-01",
            date_end: "2031-01-01",
          },
        },
        // Pass sorted leviers from navigation data
        sortedLeviers: chantier.sortedLeviers || [],
        descriptionChantier: chantier.descriptionChantier || '',
        axeTaxonomie: chantier.axeTaxonomie || [],
      };
      this.$emit("params", params);
    },
  },
  mounted() {
    // Ensure sector is set before loading
    if (!this.sector) {
      this.sector = 'Synthèse';
    }
    this.loadChantiers();
  },
  watch: {
    sector: {
      handler(newSector, oldSector) {
        if (newSector && newSector !== oldSector) {
          // When sector changes, preserve the current view if it's valid for the new sector
          // Otherwise, load chantiers which will initialize with default view
          const currentView = this.currentView
          const currentChantierId = this.currentChantierId
          
          // Reload chantiers for the new sector
          this.loadChantiers()
          
          // After loading, try to preserve the view if it makes sense
          // This will be handled by loadChantiers based on initParams
        } else if (newSector) {
          this.loadChantiers()
        }
      },
      immediate: false,
    },
    initParams: {
      handler(newParams, oldParams) {
        // When initParams change (e.g., view, chantier_id, axe, sectorFilter), apply them
        if (newParams && newParams.sector === this.sector) {
          // Check if a meaningful change occurred (not just sector)
          const viewChanged = newParams.view !== (oldParams?.view);
          const chantierChanged = newParams.chantier_id !== (oldParams?.chantier_id);
          const axeChanged = newParams.axe !== (oldParams?.axe);
          const sectorFilterChanged = newParams.sectorFilter !== (oldParams?.sectorFilter);
          
          if (viewChanged || chantierChanged || axeChanged || sectorFilterChanged) {
            this.loadChantiers()
          }
        }
      },
      deep: true,
      immediate: false,
    },
    currentView() {
      this.emitNextSectionMeta();
    },
    currentAxe() {
      this.emitNextSectionMeta();
    },
    currentChantierId() {
      this.emitNextSectionMeta();
    },
    expandedSectorName() {
      this.emitNextSectionMeta();
    },
    displayedTaxonomyAxes() {
      this.emitNextSectionMeta();
    },
    chantierSectors() {
      this.emitNextSectionMeta();
    },
    chantiers() {
      this.emitNextSectionMeta();
    },
    isLoading() {
      this.emitNextSectionMeta();
    },
    isEtatEnvironnementContext() {
      this.emitNextSectionMeta();
    },
    showChantiersAccordionSidebar() {
      this.emitNextSectionMeta();
    },
  },
};
</script>

<style scoped>
a:hover:not([href]) {
  cursor: pointer;
  background-color: #f6f6f6;
}

/* Active sidebar link: bold + blue color (single left border from DSFR) */
.fr-sidemenu__link[aria-current="page"] {
  font-weight: 700;
  color: var(--text-action-high-blue-france);
}

/* Active sector drawer button */
.sidemenu-btn--active {
  font-weight: 700;
  color: var(--text-action-high-blue-france) !important;
}

/* Section title in sector menu: label only, no link styling */
.sidemenu-section-title {
  cursor: default;
}
.sidemenu-section-title:hover {
  background-color: transparent;
}

/* Submenu styles */
.fr-sidemenu__item > .fr-sidemenu__btn {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fr-sidemenu__item > .fr-sidemenu__btn::after {
  content: "";
  display: inline-block;
  width: 1rem;
  height: 1rem;
  margin-left: auto;
  flex-shrink: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23161616' d='M12 15.586L6.707 10.293 8.121 8.879 12 12.757l3.879-3.878 1.414 1.414z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  transition: transform 0.3s ease;
}

.fr-sidemenu__item > .fr-sidemenu__btn[aria-expanded="true"]::after {
  transform: rotate(180deg);
}

.fr-sidemenu__item > .fr-sidemenu__btn:hover {
  background-color: #f6f6f6;
}

.fr-sidemenu__item > .fr-sidemenu__btn[aria-current="true"] {
  font-weight: 700;
}

.fr-sidemenu__item > .fr-collapse {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.fr-sidemenu__item > .fr-collapse.fr-collapse--expanded {
  max-height: 500px;
}

/* Chantiers lists: no 500px cap (Synthèse per-sector accordions + sectorial always-open list) */
.fr-sidemenu__item > .fr-collapse.sidemenu-chantiers-expanded.fr-collapse--expanded {
  max-height: none;
}

.fr-sidemenu__item > .fr-collapse > .fr-sidemenu__list {
  padding-left: 1rem;
  margin: 0;
  list-style: none;
}

.fr-sidemenu__item > .fr-collapse .fr-sidemenu__link {
  font-size: 0.9375rem;
  padding: 0.5rem 1rem;
}

/* Mobile: hide side navigation (use dropdown selector instead) */
@media (max-width: 991px) {
  .fr-sidemenu {
    display: none;
  }
}

/* Desktop / large tablet: sticky sidebar; no max-height so the page scrolls and
   long lists (e.g. chantiers) are never clipped inside a nested scroll area */
@media (min-width: 769px) {
  .fr-sidemenu {
    position: sticky;
    top: 80px; /* Below header */
    align-self: flex-start;
  }
}
</style>
