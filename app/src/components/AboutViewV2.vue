<template>
  <div class="home-v2">
    <header class="home-v2__hero">
      <h1 class="fr-h3 home-v2__title">Le baromètre de la planification écologique</h1>

      <div class="fr-grid-row fr-grid-row--gutters home-v2__hero-grid">
        <div class="fr-col-12 fr-col-lg-6">
          <figure class="home-v2__rosace-wrap">
            <img
              ref="rosaceImg"
              class="home-v2__rosace fr-responsive-img"
              :src="rosaceSrc"
              alt="Schéma France Nation Verte : cinq enjeux environnementaux au centre, six thématiques et leurs chantiers opérationnels autour."
              width="720"
              height="720"
              loading="lazy"
              decoding="async"
            />
          </figure>
        </div>
        <div class="fr-col-12 fr-col-lg-6 home-v2__hero-text fr-text--md">
          <div
            id="home-v2-hero-intro-region"
            ref="heroIntroClip"
            class="home-v2__hero-intro-clip"
            :class="{ 'home-v2__hero-intro-clip--expanded': heroIntroExpanded }"
            :style="heroIntroClipStyle"
          >
            <div ref="heroIntroInner" class="home-v2__hero-intro-inner">
              <p>
                Entreprises, pouvoirs publics ou citoyens, la transition écologique nous concerne tous. Pour réussir, elle demande de la transparence sur le chemin déjà parcouru et sur celui qui reste à parcourir pour atteindre les objectifs que la France s’est fixés en faveur du climat, de la biodiversité ou encore de la préservation des ressources. C'est l'objet du baromètre de la planification écologique.
              </p>
              <p>
                Fort de plus de 250 indicateurs, ce baromètre propose une vision quantifiée des actions qu’il convient de mener pour accélérer la transition dans les transports, le bâtiment, l'énergie, l'industrie, l'agriculture, l'alimentation, l'eau, les écosystèmes naturels et l'économie circulaire, en les mettant en regard de leurs éventuelles cibles à horizon 2030.
              </p>
              <p>
                Le baromètre de la planification écologique a été conçu pour rendre visibles les stratégies environnementales et faciliter leur suivi lorsqu'elles disposent d'indicateurs ad hoc, voire de cibles. Les indicateurs proposés n'intègrent donc pas les données relatives aux moyens humains ou encore financiers à mettre en œuvre pour les atteindre. De même, les impacts socio-économiques des transformations induites par le dérèglement climatique ne sont pas intégrés à ce baromètre.
              </p>
            </div>
          </div>
          <button
            v-if="heroIntroShowToggle"
            type="button"
            class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm home-v2__hero-read-more fr-mt-1w"
            :aria-expanded="heroIntroExpanded ? 'true' : 'false'"
            aria-controls="home-v2-hero-intro-region"
            @click="toggleHeroIntro"
          >
            {{ heroIntroExpanded ? 'Lire moins' : 'Lire plus' }}
          </button>
        </div>
      </div>

      <p class="fr-text--md home-v2__hero-full fr-mt-2w">
        Les sections ci-dessous reprennent la structure de la maquette&nbsp;: panneaux d’accès aux axes et aux secteurs, puis des exemples d’indicateurs issus des synthèses du tableau de bord (mis en avant différemment à chaque chargement de page).
      </p>
    </header>

    <!-- État de l'environnement -->
    <section class="home-v2__section fr-mt-6w" aria-labelledby="v2-etat-heading">
      <h2 id="v2-etat-heading" class="fr-h5 home-v2__section-title">État de l'environnement</h2>
      <p class="fr-text--sm home-v2__lead">
        L'amélioration de l'état de l'environnement constitue la finalité des stratégies environnementales. Les indicateurs sont regroupés par axe d'impact.
      </p>
      <router-link
        :to="{ name: etatRouteName, query: { section: syntheseSection } }"
        class="fr-btn fr-btn--primary fr-btn--sm fr-mt-2w fr-mb-0"
      >
        Voir la synthèse
      </router-link>

      <div class="home-v2-highlight fr-mt-3w fr-mb-4w">
        <h3 class="home-v2-highlight__title">Les axes d'impact</h3>
        <p class="home-v2-highlight__text fr-text--sm">
          Les indicateurs de l’état de l’environnement sont organisés selon six axes d’impact — atténuation et adaptation au climat, biodiversité, eau, pollution et économie circulaire — pour suivre la progression vers les objectifs nationaux.
        </p>
        <ul class="home-v2-highlight__pills" role="list">
          <li v-for="axe in impactAxes" :key="'v2-pill-axe-' + axe">
            <router-link
              :to="etatEnvironnementLink(axe)"
              class="home-v2-highlight__pill fr-raw-link"
            >
              <span class="home-v2-highlight__pill-arrow" aria-hidden="true">→</span>
              {{ axe }}
            </router-link>
          </li>
        </ul>
      </div>

      <h3 class="fr-h6 home-v2__examples-title">Exemples d'indicateurs</h3>
      <p v-if="spotlightLoading" class="fr-text--sm fr-text-mention--grey fr-mb-2w">
        Chargement d’indicateurs tirés au hasard parmi la synthèse…
      </p>
      <div v-else-if="etatSpotlights.length === 0" class="fr-col-12 fr-mb-1w">
        <p class="fr-text--sm">Aucun indicateur graphique disponible pour l’aperçu.</p>
      </div>
      <div v-else class="fr-grid-row fr-grid-row--gutters fr-mb-1w home-v2-spotlights">
        <div
          v-for="(card, i) in etatSpotlights"
          :key="'etat-spot-' + card.raw.id_indic"
          class="fr-col-12 fr-col-md-6"
        >
          <div class="home-v2-spotlight">
            <ul class="fr-badges-group fr-badges-group--sm fr-mb-1w">
              <li>
                <p class="fr-badge fr-badge--sm" :class="card.kindBadge.variant">{{ card.kindBadge.label }}</p>
              </li>
              <li>
                <p class="fr-badge fr-badge--sm fr-badge--info">{{ card.contextLabel }}</p>
              </li>
            </ul>
            <graph-box
              :data-obj="card.raw"
              :id-accordion="spotlightAccordionId('etat', i, card.raw)"
              compact
              hide-description
            />
          </div>
        </div>
      </div>
      <router-link
        :to="{ name: etatRouteName, query: { section: syntheseSection } }"
        class="fr-btn fr-btn--primary fr-btn--sm home-v2__all-indicators-btn"
      >
        Voir tous les indicateurs
      </router-link>
    </section>

    <!-- Chantiers sectoriels -->
    <section class="home-v2__section fr-mt-6w fr-mb-2w" aria-labelledby="v2-chantiers-heading">
      <h2 id="v2-chantiers-heading" class="fr-h5 home-v2__section-title">Chantiers sectoriels</h2>
      <p class="fr-text--sm home-v2__lead">
        Les chantiers structurent les transformations tangibles prévues par les stratégies environnementales, secteur par secteur.
      </p>
      <router-link
        :to="{ name: chantiersRouteName, query: { section: syntheseSection } }"
        class="fr-btn fr-btn--primary fr-btn--sm fr-mt-2w fr-mb-0"
      >
        Voir la synthèse
      </router-link>

      <div class="home-v2-highlight fr-mt-3w fr-mb-4w">
        <h3 class="home-v2-highlight__title">Les secteurs</h3>
        <p class="home-v2-highlight__text fr-text--sm">
          Chaque secteur regroupe les chantiers opérationnels et leurs leviers : accédez à la synthèse nationale ou à l’un des six grands secteurs pour consulter les indicateurs associés.
        </p>
        <ul class="home-v2-highlight__pills" role="list">
          <li v-for="item in sectorTilesV2" :key="'v2-pill-sec-' + item.shortLabel">
            <router-link
              :to="sectorLink(item)"
              class="home-v2-highlight__pill fr-raw-link"
            >
              <span class="home-v2-highlight__pill-arrow" aria-hidden="true">→</span>
              {{ item.shortLabel }}
            </router-link>
          </li>
        </ul>
      </div>

      <h3 class="fr-h6 home-v2__examples-title">Exemples d'indicateurs</h3>
      <p v-if="spotlightLoading" class="fr-text--sm fr-text-mention--grey fr-mb-2w">
        Chargement d’indicateurs tirés au hasard parmi les chantiers…
      </p>
      <div v-else-if="chantierSpotlights.length === 0" class="fr-col-12 fr-mb-1w">
        <p class="fr-text--sm">Aucun indicateur de chantier graphique disponible pour l’aperçu.</p>
      </div>
      <div v-else class="fr-grid-row fr-grid-row--gutters fr-mb-1w home-v2-spotlights">
        <div
          v-for="(card, i) in chantierSpotlights"
          :key="'chantier-spot-' + card.raw.id_indic"
          class="fr-col-12 fr-col-md-6"
        >
          <div class="home-v2-spotlight">
            <ul class="fr-badges-group fr-badges-group--sm fr-mb-1w">
              <li>
                <p class="fr-badge fr-badge--sm" :class="card.kindBadge.variant">{{ card.kindBadge.label }}</p>
              </li>
              <li>
                <p class="fr-badge fr-badge--sm fr-badge--info">{{ card.contextLabel }}</p>
              </li>
              <li v-if="card.chantierLabel">
                <p class="fr-badge fr-badge--sm fr-badge--purple-glycine">{{ card.chantierLabel }}</p>
              </li>
            </ul>
            <graph-box
              :data-obj="card.raw"
              :id-accordion="spotlightAccordionId('chantier', i, card.raw)"
              compact
              hide-description
            />
          </div>
        </div>
      </div>
      <router-link
        :to="{ name: chantiersRouteName, query: { section: syntheseSection } }"
        class="fr-btn fr-btn--primary fr-btn--sm home-v2__all-indicators-btn"
      >
        Voir tous les indicateurs
      </router-link>
    </section>
  </div>
</template>

<script>
import {
  getNavigationStructure,
  getIndicators,
  IMPACT_AXE_DISPLAY_ORDER,
  normalizeImpactAxeName,
  canonicalImpactAxeNomComplet,
  isImpactAxe
} from '@/services/csvDataService.js'
import GraphBox from '@/components/GraphBox.vue'
import { etatEnvironnementRouteName, chantiersRouteName } from '@/config/routeNames.js'
import { impactAxeNameToSlug } from '@/utils/impactAxeUrl.js'
import { SECTION_SYNTHESE_SLUG } from '@/utils/sectionUrl.js'

const SECTOR_V2_DEFS = [
  { shortLabel: 'Se déplacer', match: (n) => n === 'Se déplacer' },
  { shortLabel: 'Se loger', match: (n) => n === 'Se loger' },
  {
    shortLabel: 'Préserver',
    match: (n) => n === 'Préserver' || (n.includes('Préserver') && n.includes('écosystèmes'))
  },
  { shortLabel: 'Produire', match: (n) => n === 'Produire' },
  { shortLabel: 'Se nourrir', match: (n) => n === 'Se nourrir' },
  { shortLabel: 'Consommer', match: (n) => n === 'Consommer' }
]

const TIME_QUERY = { date_start: '2015-01-01', date_end: '2031-01-01' }
const SPOTLIGHT_COUNT = 2

function pickSectorName(matchFn, names) {
  return names.find(matchFn) || null
}

function isChartableForGraphBox(ind) {
  if (!ind || !ind.id_indic) return false
  const t = ind.type_de_graphique || 'Barres simple'
  if (t === 'Barres simple') {
    const v = ind.values
    if (!v || !v.x || !v.y) return false
    const x = Array.isArray(v.x[0]) ? v.x[0] : v.x
    const y = Array.isArray(v.y[0]) ? v.y[0] : v.y
    return Array.isArray(x) && Array.isArray(y) && x.length > 0 && y.length > 0
  }
  if (t === 'Barres empilées' || t === 'Courbes indépendantes') {
    return !!(
      ind.date &&
      Array.isArray(ind.date[0]) &&
      ind.date[0].length > 0 &&
      ind.values &&
      Array.isArray(ind.values) &&
      ind.values.length > 0
    )
  }
  return false
}

/** Dernière valeur numérique exploitable (aligné sur valeur_actuelle CSV ou lecture des séries). */
function extractLastNumericValue(ind) {
  if (ind == null) return null
  const va = ind.valeur_actuelle
  if (va != null && va !== '' && !Number.isNaN(Number(va))) {
    return Number(va)
  }
  const t = ind.type_de_graphique || 'Barres simple'
  if (t === 'Barres simple' && ind.values?.y) {
    const y = ind.values.y
    const series = Array.isArray(y[0]) ? y[0] : y
    if (Array.isArray(series)) {
      for (let i = series.length - 1; i >= 0; i--) {
        const v = series[i]
        if (v != null && v !== '' && !Number.isNaN(Number(v))) return Number(v)
      }
    }
  }
  if (ind.date?.[0] && Array.isArray(ind.values) && ind.values.length > 0) {
    const years = ind.date[0]
    const lastIdx = years.length - 1
    if (lastIdx >= 0) {
      let sum = 0
      let any = false
      for (const serie of ind.values) {
        if (Array.isArray(serie) && lastIdx < serie.length) {
          const v = serie[lastIdx]
          if (v != null && v !== '' && !Number.isNaN(Number(v))) {
            sum += Number(v)
            any = true
          }
        }
      }
      if (any) return sum
    }
  }
  return null
}

function formatLastValueWithUnitBadge(ind) {
  const unit = (ind.label_unit_short || ind.label_unit || ind.unite || '').trim()
  const num = extractLastNumericValue(ind)
  if (num == null || Number.isNaN(num)) {
    return { label: '—', variant: 'fr-badge--green-emeraude' }
  }
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4
  }).format(num)
  const label = unit ? `${formatted}\u00a0${unit}` : formatted
  return { label, variant: 'fr-badge--green-emeraude' }
}

function kindBadgeFor(ind) {
  const t = ind.type_de_graphique || 'Barres simple'
  if (t === 'Courbes indépendantes') {
    return { label: 'Évolution', variant: 'fr-badge--green-archipel' }
  }
  if (t === 'Barres empilées') {
    return { label: 'Répartition', variant: 'fr-badge--green-menthe' }
  }
  const leg = ind.values?.legend
  if (Array.isArray(leg) && leg.length > 1) {
    return { label: 'Comparaison', variant: 'fr-badge--blue-ecume' }
  }
  return formatLastValueWithUnitBadge(ind)
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function pickRandomUnique(pool, count) {
  const copy = [...pool]
  shuffleInPlace(copy)
  const out = []
  const seen = new Set()
  for (const item of copy) {
    const id = item.raw?.id_indic
    if (!id || seen.has(id)) continue
    seen.add(id)
    out.push(item)
    if (out.length >= count) break
  }
  return out
}

/**
 * Indicators d'impact par axe : on prend d'abord le secteur « Synthèse » s'il en fournit ;
 * sinon fusion de tous les secteurs (déploiement où la synthèse est vide ou absente).
 */
function mergedImpactAxesFromNavSectors(sectors) {
  if (!Array.isArray(sectors) || sectors.length === 0) return {}
  const synthese = sectors.find((s) => s.name === 'Synthèse')
  const merged = {}
  const addSector = (sector) => {
    if (!sector?.indicateursImpact) return
    for (const [axeName, indicators] of Object.entries(sector.indicateursImpact)) {
      const n = canonicalImpactAxeNomComplet(axeName) || normalizeImpactAxeName(axeName)
      if (!n) continue
      if (!merged[n]) merged[n] = []
      merged[n].push(...indicators)
    }
  }
  if (synthese) addSector(synthese)
  const hasRows = Object.values(merged).some((arr) => arr && arr.length > 0)
  if (!hasRows) {
    Object.keys(merged).forEach((k) => {
      delete merged[k]
    })
    for (const s of sectors) addSector(s)
  }
  return merged
}

export default {
  name: 'AboutViewV2',
  components: { GraphBox },
  props: {
    useStaging: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      sectorNamesFromApi: [],
      spotlightLoading: true,
      etatSpotlights: [],
      chantierSpotlights: [],
      heroIntroExpanded: false,
      heroIntroMaxHeightPx: null,
      heroIntroShowToggle: false
    }
  },
  computed: {
    syntheseSection() {
      return SECTION_SYNTHESE_SLUG
    },
    etatRouteName() {
      return etatEnvironnementRouteName(this.useStaging)
    },
    chantiersRouteName() {
      return chantiersRouteName(this.useStaging)
    },
    rosaceSrc() {
      const base = process.env.VUE_APP_PREFIX_PATH || ''
      return `${base}/images/rosace-france-nation-verte.png`
    },
    impactAxes() {
      return IMPACT_AXE_DISPLAY_ORDER
    },
    sectorTilesV2() {
      const names = this.sectorNamesFromApi
      return SECTOR_V2_DEFS.map((def) => {
        const canonicalName = pickSectorName(def.match, names)
        return {
          shortLabel: def.shortLabel,
          canonicalName: canonicalName || def.shortLabel
        }
      })
    },
    heroIntroClipStyle() {
      if (this.heroIntroExpanded || this.heroIntroMaxHeightPx == null) return {}
      return { maxHeight: `${this.heroIntroMaxHeightPx}px` }
    }
  },
  async mounted() {
    await Promise.all([this.loadSectors(), this.loadSpotlights()])
    this.$nextTick(() => {
      this.setupHeroIntroLayout()
      this.updateHeroIntroClamp()
      if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => this.updateHeroIntroClamp())
      }
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this._onHeroIntroLayout)
    const img = this.$refs.rosaceImg
    if (img && this._onHeroIntroLayout) {
      img.removeEventListener('load', this._onHeroIntroLayout)
    }
    if (this._rosaceResizeObserver) {
      this._rosaceResizeObserver.disconnect()
      this._rosaceResizeObserver = null
    }
  },
  methods: {
    spotlightAccordionId(prefix, index, raw) {
      const id = String(raw?.id_indic ?? index).replace(/[^a-zA-Z0-9-_]/g, '-')
      return `home-v2-${prefix}-spot-${index}-${id}`
    },
    slugify(str) {
      return String(str).toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    },
    async loadSectors() {
      try {
        const environment = this.useStaging ? 'staging' : 'production'
        const response = await getNavigationStructure(environment)
        if (response.status === 'success' && response.data?.sectors) {
          this.sectorNamesFromApi = response.data.sectors.map((s) => s.name)
        }
      } catch (error) {
        console.error('Error loading sectors for home V2:', error)
      }
    },
    async loadSpotlights() {
      this.spotlightLoading = true
      this.etatSpotlights = []
      this.chantierSpotlights = []
      try {
        const environment = this.useStaging ? 'staging' : 'production'
        const nav = await getNavigationStructure(environment)
        if (nav.status !== 'success' || !nav.data?.sectors) return

        const etatPool = []
        const mergedImpact = mergedImpactAxesFromNavSectors(nav.data.sectors)
        const gristToAxe = Object.create(null)
        const etatGristIds = []
        for (const axeName of IMPACT_AXE_DISPLAY_ORDER) {
          for (const item of mergedImpact[axeName] || []) {
            const gid = item.gristId
            if (!gid) continue
            const key = String(gid)
            if (!gristToAxe[key]) {
              gristToAxe[key] = axeName
              etatGristIds.push(gid)
            }
          }
        }
        if (etatGristIds.length > 0) {
          const q = {
            filter_by: [{ field: 'grist_ids', values: etatGristIds }],
            time_period: TIME_QUERY
          }
          const resp = await getIndicators(q, environment)
          for (const ind of resp.results || []) {
            if (!isChartableForGraphBox(ind)) continue
            const axeLabel = gristToAxe[String(ind.id_indic)] || 'Axe d’impact'
            etatPool.push({
              raw: ind,
              kindBadge: kindBadgeFor(ind),
              contextLabel: axeLabel
            })
          }
        }

        /** Objet indexé (évite Map.keys / itération peu fiable selon cible ou transpilation). */
        const chantierByGrist = Object.create(null)
        for (const sector of nav.data.sectors) {
          for (const [chantierName, chantierData] of Object.entries(sector.chantiers || {})) {
            if (isImpactAxe(chantierName)) continue
            const levier = chantierData.leviers?.['Indicateur de chantier'] || []
            const items = Array.isArray(levier) ? levier : []
            for (const item of items) {
              const gid = item.gristId
              if (!gid) continue
              const key = String(gid)
              if (!chantierByGrist[key]) {
                chantierByGrist[key] = {
                  sectorName: sector.name,
                  chantierName
                }
              }
            }
          }
        }

        const chantierIds = Object.keys(chantierByGrist)
        const chantierPool = []
        if (chantierIds.length > 0) {
          const q2 = {
            filter_by: [{ field: 'grist_ids', values: chantierIds }],
            time_period: TIME_QUERY
          }
          const resp2 = await getIndicators(q2, environment)
          for (const ind of resp2.results || []) {
            if (!isChartableForGraphBox(ind)) continue
            const meta = chantierByGrist[String(ind.id_indic)]
            if (!meta) continue
            const shortChantier =
              meta.chantierName.length > 42
                ? `${meta.chantierName.slice(0, 40)}…`
                : meta.chantierName
            chantierPool.push({
              raw: ind,
              kindBadge: kindBadgeFor(ind),
              contextLabel: meta.sectorName,
              chantierLabel: shortChantier
            })
          }
        }

        this.etatSpotlights = pickRandomUnique(etatPool, SPOTLIGHT_COUNT)
        this.chantierSpotlights = pickRandomUnique(chantierPool, SPOTLIGHT_COUNT)
      } catch (e) {
        console.error('AboutViewV2 loadSpotlights:', e)
      } finally {
        this.spotlightLoading = false
      }
    },
    etatEnvironnementLink(axe) {
      return {
        name: this.etatRouteName,
        query: { section: SECTION_SYNTHESE_SLUG },
        hash: '#axe-' + impactAxeNameToSlug(axe)
      }
    },
    chantiersSectorielsLink(sector) {
      return {
        name: this.chantiersRouteName,
        query: { section: SECTION_SYNTHESE_SLUG },
        hash: '#sector-' + this.slugify(sector)
      }
    },
    sectorLink(item) {
      return this.chantiersSectorielsLink(item.canonicalName)
    },
    setupHeroIntroLayout() {
      if (this._heroIntroLayoutBound) return
      this._heroIntroLayoutBound = true
      this._onHeroIntroLayout = () => {
        window.requestAnimationFrame(() => this.updateHeroIntroClamp())
      }
      window.addEventListener('resize', this._onHeroIntroLayout)
      const img = this.$refs.rosaceImg
      if (img) {
        img.addEventListener('load', this._onHeroIntroLayout)
        if (typeof ResizeObserver !== 'undefined') {
          this._rosaceResizeObserver = new ResizeObserver(this._onHeroIntroLayout)
          this._rosaceResizeObserver.observe(img)
        }
      }
    },
    updateHeroIntroClamp() {
      const img = this.$refs.rosaceImg
      const inner = this.$refs.heroIntroInner
      if (!img || !inner) return

      const isLgUp = window.matchMedia('(min-width: 62em)').matches
      if (!isLgUp) {
        this.heroIntroMaxHeightPx = null
        this.heroIntroShowToggle = false
        this.heroIntroExpanded = false
        return
      }

      const h = img.offsetHeight
      if (!h) {
        this.heroIntroMaxHeightPx = null
        this.heroIntroShowToggle = false
        return
      }
      this.heroIntroMaxHeightPx = h
      this.$nextTick(() => {
        const overflows = inner.scrollHeight > h + 4
        this.heroIntroShowToggle = overflows
        if (!overflows) this.heroIntroExpanded = false
      })
    },
    toggleHeroIntro() {
      this.heroIntroExpanded = !this.heroIntroExpanded
    }
  }
}
</script>

<style scoped>
.home-v2 {
  --home-v2-max: 58rem;
  max-width: var(--home-v2-max);
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  box-sizing: border-box;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.home-v2__title {
  text-align: center;
  margin-top: 1.5rem;
  margin-bottom: 2rem;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.25;
}

.home-v2__rosace-wrap {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin: 0;
  padding: 0;
}

.home-v2__rosace {
  width: 100%;
  max-width: min(100%, 17rem);
  height: auto;
  display: block;
}

.home-v2__hero-text {
  text-align: left;
}

.home-v2__hero-intro-clip {
  overflow: hidden;
  transition: max-height 0.4s ease;
}

@media (prefers-reduced-motion: reduce) {
  .home-v2__hero-intro-clip {
    transition: none;
  }
}

.home-v2__hero-intro-clip--expanded {
  max-height: none !important;
  overflow: visible;
}

.home-v2__hero-text .home-v2__hero-intro-inner p:last-child {
  margin-bottom: 0;
}

.home-v2__hero-read-more {
  display: inline-flex;
  align-self: flex-start;
}

.home-v2__hero-text p {
  margin-bottom: 1rem;
  line-height: 1.65;
}

.home-v2__hero-full {
  text-align: left;
  line-height: 1.65;
  color: #3a3a3a;
}

.home-v2__section-title {
  text-align: left;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.home-v2__lead {
  max-width: 36rem;
  margin-bottom: 0;
  line-height: 1.6;
  color: #3a3a3a;
  text-align: left;
}

.home-v2__examples-title {
  margin-bottom: 1rem;
  font-weight: 700;
}

/* Moins d’air autour du CTA sous les cartes indicateurs */
.home-v2__all-indicators-btn {
  margin-top: 0.25rem;
  margin-bottom: 0;
}

/* Bloc type maquette : fond gris + liseré bleu France à gauche + pastilles → */
.home-v2-highlight {
  background-color: #f6f6f6;
  border-left: 4px solid #000091;
  padding: 1.5rem 1.25rem;
  box-sizing: border-box;
}

@media (min-width: 36em) {
  .home-v2-highlight {
    padding: 1.75rem 1.75rem 1.5rem 1.5rem;
  }
}

.home-v2-highlight__title {
  margin: 0 0 0.75rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: #161616;
  text-align: left;
  line-height: 1.35;
}

.home-v2-highlight__text {
  margin: 0 0 1.25rem;
  color: #3a3a3a;
  line-height: 1.65;
  text-align: left;
  max-width: none;
}

.home-v2-highlight__pills {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: flex-start;
  justify-content: flex-start;
}

.home-v2-highlight__pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  background-color: #ececfe;
  color: #000091;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  line-height: 1.3;
  border: 1px solid rgba(0, 0, 145, 0.12);
  transition: background-color 0.15s ease, box-shadow 0.15s ease;
}

.home-v2-highlight__pill:hover {
  background-color: #e0e0f4;
  color: #1212ff;
  text-decoration: none;
  box-shadow: 0 1px 2px rgba(0, 0, 89, 0.08);
}

.home-v2-highlight__pill:focus-visible {
  outline: 2px solid #000091;
  outline-offset: 2px;
}

.home-v2-highlight__pill-arrow {
  flex-shrink: 0;
  font-size: 0.95em;
  opacity: 0.85;
}

.home-v2-spotlight :deep(.graph-box-card--compact) {
  margin-bottom: 0;
}

.home-v2-spotlight :deep(.graph-box-card--compact .graph-box-title) {
  font-size: 1rem;
  line-height: 1.35;
}

</style>
