<template>
  <div class="fr-container--fluid">
    <!-- Sector selector - always visible, especially important on mobile -->
    <sector-selector :currentSector="currentSector" />
    
    <div class="fr-grid-row">
      <aside v-show="!isAccueilPage" class="fr-col-12 fr-col-sm-12 fr-col-lg-3 fr-mb-sm-5w sidebar-container">
        <div id="sidebar" class="fr-ml-2w">
          <side-navigation
            ref="sideNavigation"
            v-on:params="updateSelection"
            v-on:next-section-meta="onNextSectionMeta"
            :initParams="sidenav_initParams"
            :useStaging="useStaging"
            :sector="currentSector"
          />
        </div>
      </aside>
      <section class="fr-col dashboard-main-section">
        <div class="dashboard-main-section__inner">
          <div class="fr-container--fluid fr-container-page">
            <div v-if="!isapiloading || myobj.view === 'about' || myobj.view === 'chantiers-sectoriels' || myobj.view === 'etat-environnement'">
              <!-- Chantiers sectoriels synthèse view -->
              <synthese-sectorielle
                v-if="myobj.view === 'chantiers-sectoriels'"
                :params="myobj"
                :useStaging="useStaging"
              />
              <!-- Etat de l'environnement view -->
              <etat-environnement
                v-else-if="myobj.view === 'etat-environnement'"
                :params="myobj"
                :useStaging="useStaging"
              />
              <!-- About view -->
              <about-view
                v-else-if="myobj.view === 'about'"
                :useStaging="useStaging"
              />
              <!-- General Engagements view -->
              <general-engagements-view 
                v-else-if="myobj.view === 'general-engagements'"
                :params="myobj" 
                :inputData="results_API"
                :useStaging="useStaging"
              />
              <!-- General Chantiers view -->
              <general-chantiers-view 
                v-else-if="myobj.view === 'general-chantiers'"
                :params="myobj" 
                :inputData="results_API"
                :useStaging="useStaging"
              />
              <!-- Sectorial Engagements view -->
              <sectorial-engagements-view 
                v-else-if="myobj.view === 'sectorial-engagements'"
                :params="myobj" 
                :inputData="results_API"
                :useStaging="useStaging"
              />
              <!-- Chantier detail view -->
              <chantier-detail
                v-else-if="myobj.view === 'chantier'"
                :params="myobj"
                :chantierData="results_API"
                :useStaging="useStaging"
              />
              <!-- Fallback to adaptive dashboard -->
              <adaptive-dashboard 
                v-else
                :params="myobj" 
                :inputData="results_API"
              />
            </div>
            <div v-else>
              <p>Chargement des indicateurs...</p>
            </div>
            <section-next-bar
              v-if="!isAccueilPage"
              :enabled="sectionNextMeta.enabled"
              :next-label="sectionNextMeta.label || ''"
              @go-next="goToNextSidebarSection"
            />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
// Import CSV data service instead of API
import { getIndicators } from "@/services/csvDataService.js";
import UpFooter from "../components/UpFooter.vue";
import AdaptiveDashboard from "../components/AdaptiveDashboard.vue";
import SideNavigation from "../components/SideNavigation.vue";
import ChantierDetail from "../components/ChantierDetail.vue";
import GeneralEngagementsView from "../components/GeneralEngagementsView.vue";
import GeneralChantiersView from "../components/GeneralChantiersView.vue";
import SectorialEngagementsView from "../components/SectorialEngagementsView.vue";
import SectorSelector from "../components/SectorSelector.vue";
import AboutView from "../components/AboutView.vue";
import SyntheseSectorielle from "../components/SyntheseSectorielle.vue";
import EtatEnvironnement from "../components/EtatEnvironnement.vue";
import SectionNextBar from "../components/SectionNextBar.vue";
import dsfrAnalytics from "../services/dsfr_analytics"
import {
  homeRouteName,
  dashboardRouteName,
  etatEnvironnementRouteName,
  chantiersRouteName,
} from "@/config/routeNames.js"
import {
  resolveSectorFromQuery,
  toSectionSlug,
  SECTOR_SYNTHESE,
  SECTION_SYNTHESE_SLUG,
} from "@/utils/sectionUrl.js"
import {
  impactAxeNameToSlug,
  impactAxeSlugToName,
  isImpactAxeSlug,
} from "@/utils/impactAxeUrl.js"
import { getNavigationStructure } from "@/services/csvDataService.js"

export default {
  name: "DashboardPage",
  props: {
    query: {
      type: String,
      default: null
    },
    useStaging: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    isAccueilPage() {
      const n = this.$route.name
      return (
        n === "home" ||
        n === "staging-home" ||
        this.$route.query.view === "about" ||
        this.myobj?.view === "about"
      )
    }
  },
  components: {
    UpFooter,
    AdaptiveDashboard,
    SideNavigation,
    ChantierDetail,
    GeneralEngagementsView,
    GeneralChantiersView,
    SectorialEngagementsView,
    SectorSelector,
    AboutView,
    SyntheseSectorielle,
    EtatEnvironnement,
    SectionNextBar,
  },

  // Initialisation des données
  data() {
    return {
      isapiloading: true,
      myobj: {},
      results_API: [],
      sidenav_initParams: {},
      currentSector: 'Synthèse',
      knownSectorNames: [],
      sectionNextMeta: { label: null, enabled: false },
    };
  },
  created() {
    if (this.$route.name === "home" || this.$route.name === "staging-home") {
      this.applyHomeRouteState()
    } else {
      this.initDashboardFromRoute()
    }
    getNavigationStructure(this.useStaging ? "staging" : "production").then((res) => {
      if (res.status === "success" && res.data?.sectorNames) {
        this.knownSectorNames = res.data.sectorNames
        if (this.$route.name !== "home" && this.$route.name !== "staging-home") {
          this.initDashboardFromRoute()
        } else {
          this.applyHomeRouteState()
        }
      }
    })
  },
  watch: {
    "$route.name"(name) {
      if (name === "home" || name === "staging-home") {
        this.applyHomeRouteState()
        return
      }
      if (this.isDashboardShellRouteName(name)) {
        this.initDashboardFromRoute()
      }
    },
    "$route.query": {
      deep: true,
      handler(newQuery) {
        if (this.$route.name === "home" || this.$route.name === "staging-home") return
        if (!this.isDashboardShellRouteName(this.$route.name)) return
        this.currentSector = resolveSectorFromQuery(newQuery, this.knownSectorNames)
        // Utiliser newQuery (argument du watcher), pas this.$route.query : au même tick,
        // impliedViewFromRouteName() pouvait encore lire l’ancienne query → vue « chantier »
        // conservée alors que l’URL pointait déjà vers la synthèse (fil d’Ariane, badges…).
        let view = newQuery.view
          ? newQuery.view
          : this.resolveShellViewFromQuery(newQuery)
        let axeResolved = newQuery.axe
        let chantierSectorResolved = newQuery.chantier_sector
        const onEtat =
          this.$route.name === "etat-environnement" ||
          this.$route.name === "staging-etat-environnement"
        if (onEtat && newQuery.section) {
          const slug = String(newQuery.section).toLowerCase()
          if (slug !== SECTION_SYNTHESE_SLUG && isImpactAxeSlug(slug)) {
            view = "general-engagements"
            axeResolved = impactAxeSlugToName(slug)
          }
        }
        const onChantiers =
          this.$route.name === "chantiers" ||
          this.$route.name === "staging-chantiers"
        if (
          onChantiers &&
          newQuery.chantier_id &&
          newQuery.section &&
          (!newQuery.view || newQuery.view === "chantier")
        ) {
          const chSlug = String(newQuery.section).toLowerCase()
          if (chSlug !== SECTION_SYNTHESE_SLUG) {
            view = "chantier"
            if (!chantierSectorResolved && this.currentSector !== SECTOR_SYNTHESE) {
              chantierSectorResolved = this.currentSector
            }
          }
        }
        if (
          !view &&
          this.currentSector !== SECTOR_SYNTHESE &&
          (this.$route.name === "dashboard" || this.$route.name === "staging-dashboard")
        ) {
          view = "sectorial-engagements"
        }
        const newParams = { sector: this.currentSector }
        if (view) newParams.view = view
        if (newQuery.chantier_id) newParams.chantier_id = newQuery.chantier_id
        if (axeResolved) newParams.axe = axeResolved
        if (newQuery.sectorFilter) newParams.sectorFilter = newQuery.sectorFilter
        if (chantierSectorResolved) newParams.chantier_sector = chantierSectorResolved
        if (newQuery.theme !== undefined) newParams.id_theme = newQuery.theme
        if (newQuery.levier !== undefined) newParams.id_levier = newQuery.levier
        this.sidenav_initParams = newParams

        // Même route /chantiers : seule la query change → $route.name ne bouge pas et
        // initDashboardFromRoute ne repasse pas. Il faut aligner myobj (comme pour
        // etat-environnement → home où le nom de route change).
        if (
          (this.$route.name === "chantiers" ||
            this.$route.name === "staging-chantiers") &&
          view === "chantiers-sectoriels"
        ) {
          this.myobj = {
            view: "chantiers-sectoriels",
            sector: this.currentSector,
          }
          this.isapiloading = false
        }
      },
    },
  },
  methods: {
    onNextSectionMeta(meta) {
      if (meta && typeof meta === "object") {
        this.sectionNextMeta = {
          label: meta.label || null,
          enabled: !!meta.enabled,
        };
      } else {
        this.sectionNextMeta = { label: null, enabled: false };
      }
    },
    goToNextSidebarSection() {
      const sn = this.$refs.sideNavigation;
      if (sn && typeof sn.goToNextSection === "function") {
        sn.goToNextSection();
      }
    },
    isDashboardShellRouteName(name) {
      return [
        "dashboard",
        "staging-dashboard",
        "etat-environnement",
        "staging-etat-environnement",
        "chantiers",
        "staging-chantiers",
      ].includes(name)
    },
    /** Vue shell déduite d’une query précise (pour le watcher $route.query). */
    resolveShellViewFromQuery(q) {
      const n = this.$route.name
      if (n === "etat-environnement" || n === "staging-etat-environnement") {
        if (q.section) {
          const slug = String(q.section).toLowerCase()
          if (slug !== SECTION_SYNTHESE_SLUG && isImpactAxeSlug(slug)) {
            return "general-engagements"
          }
        }
        return q.view || "etat-environnement"
      }
      if (n === "chantiers" || n === "staging-chantiers") {
        const slug = String(q.section || "").toLowerCase()
        const qv = q.view
        if (
          q.chantier_id &&
          slug &&
          slug !== SECTION_SYNTHESE_SLUG &&
          (!qv || qv === "chantier")
        ) {
          return "chantier"
        }
        return qv || "chantiers-sectoriels"
      }
      return undefined
    },
    impliedViewFromRouteName() {
      return this.resolveShellViewFromQuery(this.$route.query || {})
    },
    applyHomeRouteState() {
      this.currentSector = resolveSectorFromQuery(this.$route.query, this.knownSectorNames)
      this.sidenav_initParams = { sector: this.currentSector, view: "about" }
      this.myobj = { view: "about", sector: this.currentSector }
      this.isapiloading = false
    },
    initDashboardFromRoute() {
      const q = this.$route.query
      this.currentSector = resolveSectorFromQuery(q, this.knownSectorNames)
      let view = q.view || this.impliedViewFromRouteName()
      let axeResolved = q.axe
      const onEtat =
        this.$route.name === "etat-environnement" ||
        this.$route.name === "staging-etat-environnement"
      if (onEtat && q.section) {
        const slug = String(q.section).toLowerCase()
        if (slug !== SECTION_SYNTHESE_SLUG && isImpactAxeSlug(slug)) {
          view = "general-engagements"
          axeResolved = impactAxeSlugToName(slug)
        }
      }
      const onChantiers =
        this.$route.name === "chantiers" ||
        this.$route.name === "staging-chantiers"
      let chantierSectorInit = q.chantier_sector
      if (
        onChantiers &&
        q.chantier_id &&
        q.section &&
        (!q.view || q.view === "chantier")
      ) {
        const chSlug = String(q.section).toLowerCase()
        if (chSlug !== SECTION_SYNTHESE_SLUG) {
          view = "chantier"
          if (!chantierSectorInit && this.currentSector !== SECTOR_SYNTHESE) {
            chantierSectorInit = this.currentSector
          }
        }
      }
      this.sidenav_initParams = { sector: this.currentSector }
      if (view) this.sidenav_initParams.view = view
      if (q.chantier_id) this.sidenav_initParams.chantier_id = q.chantier_id
      if (axeResolved) this.sidenav_initParams.axe = axeResolved
      if (q.sectorFilter) this.sidenav_initParams.sectorFilter = q.sectorFilter
      if (chantierSectorInit) this.sidenav_initParams.chantier_sector = chantierSectorInit
      if (q.theme !== undefined || q.levier !== undefined) {
        this.sidenav_initParams.id_theme = q.theme
        this.sidenav_initParams.id_levier = q.levier
      }
      if (view === "about" || view === "chantiers-sectoriels" || view === "etat-environnement") {
        this.myobj = { view, sector: this.currentSector }
        this.isapiloading = false
      } else {
        this.myobj = {}
        this.isapiloading = true
      }
    },
    /**
     * Normalise la query des routes « shell » chantiers : la cible de navigation n’inclut
     * pas ces `view` implicites ; en prod (proxy, ordre des param, doublons) l’URL réelle
     * peut encore les porter — on les retire pour comparer au même référentiel.
     */
    chantiersShellQueryForCompare(routeName, query) {
      const o = { ...(query || {}) }
      if (routeName === "chantiers" || routeName === "staging-chantiers") {
        if (o.view === "chantiers-sectoriels" || o.view === "chantiers-table") delete o.view
        if (o.view === "chantier" && o.chantier_id) delete o.view
      }
      return o
    },
    /** Valeur de paramètre d’URL comparable (évite divergences prod : tableau, typage). */
    queryParamComparable(val) {
      if (val === undefined || val === null) return ""
      const v = Array.isArray(val) ? val[0] : val
      if (v === undefined || v === null) return ""
      return String(v)
    },
    /**
     * `path` + query triée, même sémantique que l’URL affichée après navigation.
     * Préféré à une boucle clé par clé : ordre des params et formes (array vs string) diffèrent
     * souvent entre environnements.
     */
    canonicalPathAndQuery(routeLike) {
      const path = routeLike.path || ""
      const name = routeLike.name
      const q = this.chantiersShellQueryForCompare(name, routeLike.query)
      const keys = Object.keys(q).sort()
      const pairs = []
      for (const k of keys) {
        const raw = q[k]
        if (raw === undefined || raw === null) continue
        const s = this.queryParamComparable(raw)
        pairs.push(`${encodeURIComponent(k)}=${encodeURIComponent(s)}`)
      }
      return pairs.length ? `${path}?${pairs.join("&")}` : path
    },
    /** True si la navigation Vue changerait réellement l’URL (hors #hash). */
    shouldPushRouterTarget(target) {
      try {
        const resolved = this.$router.resolve(target, this.$route)
        const next = resolved.route
        const cur = this.$route
        const a = this.canonicalPathAndQuery(next)
        const b = this.canonicalPathAndQuery(cur)
        return a !== b
      } catch (e) {
        return true
      }
    },
    // Mise à jour de la sélection dans le menu
    updateSelection(selectedValue) {
      if (selectedValue != undefined) {
        this.myobj = selectedValue;
        // Only fetch data if the view needs it (not about or chantiers-sectoriels which fetch their own)
        const selfLoadingViews = ['about', 'chantiers-sectoriels', 'etat-environnement'];
        if (!selfLoadingViews.includes(selectedValue.view) && selectedValue.query) {
          this.fetchData(selectedValue.query);
        } else if (selfLoadingViews.includes(selectedValue.view)) {
          this.isapiloading = false;
        }

        // Navigation : chemins dédiés + ?section= (slug), sans ?sector=
        try {
          const querySector = selectedValue.sector || this.currentSector
          const st = this.useStaging
          const sec = toSectionSlug(querySector)

          if (selectedValue.view === "about" && querySector === SECTOR_SYNTHESE) {
            const homeName = homeRouteName(st)
            if (this.$route.name !== homeName) {
              this.$router.push({ name: homeName }).catch(() => {})
            }
            return
          }

          const withSection = (extra = {}) => ({ section: sec, ...extra })

          let target = null
          const v = selectedValue.view

          if (v === "etat-environnement" || v === "engagements-table") {
            target = { name: etatEnvironnementRouteName(st), query: withSection() }
          } else if (v === "general-engagements") {
            if (selectedValue.axe) {
              target = {
                name: etatEnvironnementRouteName(st),
                query: { section: impactAxeNameToSlug(selectedValue.axe) },
              }
            } else {
              target = {
                name: etatEnvironnementRouteName(st),
                query: {
                  section: SECTION_SYNTHESE_SLUG,
                  view: "general-engagements",
                },
              }
            }
          } else if (v === "chantiers-sectoriels" || v === "chantiers-table") {
            target = { name: chantiersRouteName(st), query: withSection() }
          } else if (v === "general-chantiers") {
            target = {
              name: chantiersRouteName(st),
              query: withSection({
                view: "general-chantiers",
                ...(selectedValue.sectorFilter ? { sectorFilter: selectedValue.sectorFilter } : {}),
              }),
            }
          } else if (v === "chantier" && selectedValue.chantier_id != null && String(selectedValue.chantier_id).length) {
            const secSlug = selectedValue.chantier_sector
              ? toSectionSlug(selectedValue.chantier_sector)
              : sec
            target = {
              name: chantiersRouteName(st),
              query: {
                section: String(secSlug),
                chantier_id: String(selectedValue.chantier_id),
              },
            }
          } else if (v === "chantier") {
            return
          } else {
            const q = withSection()
            if (v === "sectorial-engagements") q.view = "sectorial-engagements"
            else if (v === "about") q.view = "about"
            target = { name: dashboardRouteName(st), query: q }
          }

          if (!target) return
          if (this.shouldPushRouterTarget(target)) {
            this.$router.push(target).catch((err) => {
              if (err && err.name !== "NavigationDuplicated") {
                console.error("router.push:", err)
              }
            })
          }
        } catch (error) {
          console.error("Erreur dans le chargement de la navigation : ", error);
        }
      }
    },
    // Récupération des données de l'API
    async fetchData(query) {
      this.isapiloading = true;
      // Use CSV data service instead of API
      try {
        const response = await getIndicators(query, this.useStaging ? 'staging' : 'production');
        // Set results directly from CSV data service
        this.results_API = response.results;
        this.isapiloading = false;
      } catch (error) {
        console.error("Erreur dans le chargement des données CSV : ", error);
      }
    },
  },
  mounted(){
    const st = this.useStaging
    const n = this.$route.name
    let path = "/dashboard"
    if (n === homeRouteName(st)) path = st ? "/staging" : "/"
    else if (n === etatEnvironnementRouteName(st)) path = st ? "/staging/etat-environnement" : "/etat-environnement"
    else if (n === chantiersRouteName(st)) path = st ? "/staging/chantiers" : "/chantiers"
    else if (st) path = "/staging/dashboard"
    dsfrAnalytics({
      path,
      name: n,
      segment: "tableau_de_bord",
      labels: ['contenu_liste', 'tableau_de_bord', '', '', ''],
      template: "contenu_liste",
      group: "tableau_de_bord"
    })
  }
};
</script>
<style scoped lang="scss">
/* Permet au contenu de respecter la largeur viewport (flex/grid DSFR) */
.dashboard-main-section,
.dashboard-main-section__inner {
  min-width: 0;
  max-width: 100%;
}

.fr-container-page {
  background-color: #fff;
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
  padding-left: 2.5rem;
  padding-right: 2.5rem;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
}

/* Mobile optimizations */
@media (max-width: 991px) {
  .fr-container-page {
    padding-left: 1rem;
    padding-right: 1rem;
    padding-top: 1rem;
  }
}

@media (min-width: 992px) {
  #sidebar {
    margin-left: 0.5rem;
  }
}
</style>

