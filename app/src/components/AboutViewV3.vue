<template>
  <div class="home-v3">
    <!-- Hero -->
    <header class="home-v3__hero">
      <h1 class="fr-h3 home-v3__title">Réussir simultanément nos transitions écologiques</h1>

      <div class="fr-grid-row fr-grid-row--gutters home-v3__hero-grid">
        <div class="fr-col-12 fr-col-lg-6">
          <figure class="home-v3__rosace-wrap">
            <img
              class="home-v3__rosace fr-responsive-img"
              :src="rosaceSrc"
              alt="Schéma France Nation Verte : cinq enjeux environnementaux au centre, six thématiques et leurs chantiers opérationnels autour."
              width="720"
              height="720"
              loading="eager"
              decoding="async"
            />
          </figure>
        </div>
        <div class="fr-col-12 fr-col-lg-6 home-v3__hero-text fr-text--md">
          <p>
            Réduire nos émissions, s'adapter au climat qui change, protéger l'eau et la nature, moins gaspiller, moins polluer.
            Ces défis systémiques sont interdépendants - et ils nous concernent tous, dans notre façon de nous déplacer, nous loger, nous nourrir.
            Fort de plus de 250 indicateurs, ce baromètre propose une vision quantifiée de ces transitions.
          </p>
        </div>
      </div>
    </header>

    <!-- 1 - Améliorer l'état de l'environnement -->
    <section class="home-v3__section fr-mt-6w" aria-labelledby="v3-enjeux-heading">
      <p class="home-v3__eyebrow home-v3__eyebrow--pill">1 - Améliorer l'état de l'environnement</p>
      <h2 id="v3-enjeux-heading" class="fr-h5 home-v3__section-title">6 grands objectifs stratégiques</h2>
      <p class="home-v3__lead">
        L'amélioration concrète de l'état de l'environnement constitue la finalité de ces politiques publiques.
        Pour mesurer la réussite de cette trajectoire, ce baromètre est structuré autour des 6 objectifs de la taxonomie européenne.
      </p>
      <router-link
        :to="{ name: etatRouteName, query: { section: syntheseSection } }"
        class="fr-btn fr-btn--primary fr-btn--sm fr-mt-2w fr-mb-3w"
      >
        Voir la synthèse
      </router-link>
      <div class="fr-grid-row fr-grid-row--gutters home-v3__cards">
        <div
          v-for="axe in axeTiles"
          :key="'v3-axe-' + axe.name"
          class="fr-col-12 fr-col-md-4"
        >
          <router-link :to="etatEnvironnementLink(axe.name)" class="home-v3-card">
            <div class="home-v3-card__body">
              <div class="home-v3-card__picto" :class="{ 'home-v3-card__picto--eau': axe.useEau }">
                <eau-img v-if="axe.useEau" width="56px" height="56px" />
                <dsfr-pictogram v-else-if="axe.pictoId" :picto-id="axe.pictoId" :size="56" />
              </div>
              <h3 class="home-v3-card__heading">{{ axe.displayName }}</h3>
              <span class="fr-icon-arrow-right-line home-v3-card__arrow" aria-hidden="true" />
            </div>
          </router-link>
        </div>
      </div>
      <h3 class="fr-h6 home-v3__examples-title">Exemples d'indicateurs</h3>
      <p v-if="spotlightLoading" class="fr-text--sm fr-text-mention--grey">
        Chargement d'indicateurs tirés au hasard parmi la synthèse…
      </p>
      <div v-else-if="etatSpotlights.length === 0" class="fr-col-12 fr-mb-1w">
        <p class="fr-text--sm">Aucun indicateur graphique disponible pour l'aperçu.</p>
      </div>
      <div v-else class="fr-grid-row fr-grid-row--gutters home-v3-spotlights">
        <div
          v-for="card in etatSpotlights"
          :key="'etat-spot-' + card.raw.id_indic"
          class="fr-col-12 fr-col-md-6"
        >
          <div class="home-v3-spotlight">
            <ul class="fr-badges-group fr-badges-group--sm fr-mb-1w">
              <li>
                <p class="fr-badge fr-badge--sm" :class="card.kindBadge.variant">{{ card.kindBadge.label }}</p>
              </li>
              <li>
                <p class="fr-badge fr-badge--sm fr-badge--info">{{ card.contextLabel }}</p>
              </li>
            </ul>
            <mini-chart :dataObj="card.raw" />
          </div>
        </div>
      </div>
    </section>

    <!-- 2 - Déployer nos chantiers sectoriels -->
    <section class="home-v3__section fr-mt-6w" aria-labelledby="v3-secteurs-heading">
      <p class="home-v3__eyebrow home-v3__eyebrow--pill">2 - Déployer nos chantiers sectoriels</p>
      <h2 id="v3-secteurs-heading" class="fr-h5 home-v3__section-title">Des transformations tangibles de notre quotidien</h2>
      <p class="home-v3__lead">
        L'atteinte de nos cibles écologiques impose le déploiement de transformations concrètes, structurées par grands
        secteurs d'activité. Chaque secteur fait l'objet de chantiers précis.
      </p>
      <router-link
        :to="{ name: chantiersRouteName, query: { section: syntheseSection } }"
        class="fr-btn fr-btn--primary fr-btn--sm fr-mt-2w fr-mb-3w"
      >
        Voir la synthèse
      </router-link>
      <div class="fr-grid-row fr-grid-row--gutters home-v3__cards">
        <div
          v-for="item in sectorTiles"
          :key="'v3-sector-' + item.canonicalName"
          class="fr-col-12 fr-col-md-4"
        >
          <router-link :to="chantiersSectorielsLink(item.canonicalName)" class="home-v3-card home-v3-card--rich">
            <div class="home-v3-card__body">
              <div class="home-v3-card__picto">
                <dsfr-pictogram :picto-id="item.pictoId" :size="56" />
              </div>
              <h3 class="home-v3-card__heading">{{ item.shortLabel }}</h3>
              <p class="home-v3-card__desc fr-text--sm">{{ item.blurb }}</p>
              <span class="fr-icon-arrow-right-line home-v3-card__arrow" aria-hidden="true" />
            </div>
          </router-link>
        </div>
      </div>
      <h3 class="fr-h6 home-v3__examples-title">Exemples d'indicateurs</h3>
      <p v-if="spotlightLoading" class="fr-text--sm fr-text-mention--grey">
        Chargement d'indicateurs tirés au hasard parmi les chantiers…
      </p>
      <div v-else-if="chantierSpotlights.length === 0" class="fr-col-12 fr-mb-1w">
        <p class="fr-text--sm">Aucun indicateur de chantier graphique disponible pour l'aperçu.</p>
      </div>
      <div v-else class="fr-grid-row fr-grid-row--gutters home-v3-spotlights">
        <div
          v-for="card in chantierSpotlights"
          :key="'chantier-spot-' + card.raw.id_indic"
          class="fr-col-12 fr-col-md-6"
        >
          <div class="home-v3-spotlight">
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
            <mini-chart :dataObj="card.raw" />
          </div>
        </div>
      </div>
    </section>

    <!-- 3 - Planifier et évaluer -->
    <section class="home-v3__section fr-mt-6w fr-mb-4w" aria-labelledby="v3-strategies-heading">
      <p class="home-v3__eyebrow home-v3__eyebrow--pill">3 - Planifier et évaluer</p>
      <h2 id="v3-strategies-heading" class="fr-h5 home-v3__section-title">Un pilotage unifié des feuilles de route environnementales</h2>
      <p class="home-v3__lead">
        Ce baromètre constitue l'outil central de transparence en matière d'environnement. 
        Il a été conçu pour rendre visibles les stratégies environnementales et faciliter le suivi de leurs
        résultats. Les indicateurs proposés n'intègrent donc pas les données relatives aux moyens humains ou encore financiers
        à mettre en œuvre pour les atteindre. De même, les impacts socio-économiques des transformations induites par le
        dérèglement climatique ne sont pas intégrés à ce baromètre.
      </p>

      <ul class="home-v3-strategies" role="list">
        <li v-for="strategy in strategies" :key="strategy.code" class="home-v3-strategy" :style="{ '--strategy-color': strategy.color }">
          <span class="home-v3-strategy__code">{{ strategy.code }}</span>
          <span class="home-v3-strategy__label">{{ strategy.label }}</span>
        </li>
      </ul>

      <div class="home-v3-stats">
        <div class="home-v3-stat">
          <p class="home-v3-stat__value">130+</p>
          <p class="home-v3-stat__label">leviers d'action recensés</p>
        </div>
        <div class="home-v3-stat">
          <p class="home-v3-stat__value">6</p>
          <p class="home-v3-stat__label">enjeux croisés avec 6 secteurs</p>
        </div>
        <div class="home-v3-stat">
          <p class="home-v3-stat__value">1</p>
          <p class="home-v3-stat__label">cadre commun de lecture</p>
        </div>
      </div>
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
  isImpactAxe,
  impactAxeSlugFromNomComplet,
} from '@/services/csvDataService.js'
import { impactAxeUiForSlug } from '@/config/impactAxeUi.js'
import { etatEnvironnementRouteName, chantiersRouteName } from '@/config/routeNames.js'
import { impactAxeNameToSlug } from '@/utils/impactAxeUrl.js'
import { SECTION_SYNTHESE_SLUG } from '@/utils/sectionUrl.js'
import EauImg from '@/components/components_sgv/EauImg.vue'
import DsfrPictogram from '@/components/components_dsfr/DsfrPictogram.vue'
import MiniChart from '@/components/MiniChart.vue'

/** Ordre d'affichage des cartes secteurs (libellé court → correspondance dans les données) */
const SECTOR_CARD_DEFS = [
  { shortLabel: 'Consommer', match: (n) => n === 'Consommer', pictoId: 'digital-application' },
  {
    shortLabel: 'Préserver',
    match: (n) => n === 'Préserver' || (n.includes('Préserver') && n.includes('écosystèmes')),
    pictoId: 'environment-human-cooperation'
  },
  { shortLabel: 'Produire', match: (n) => n === 'Produire', pictoId: 'buildings-factory' },
  { shortLabel: 'Se déplacer', match: (n) => n === 'Se déplacer', pictoId: 'map-map' },
  { shortLabel: 'Se loger', match: (n) => n === 'Se loger', pictoId: 'buildings-house' },
  { shortLabel: 'Se nourrir', match: (n) => n === 'Se nourrir', pictoId: 'environment-food' }
]

const SECTOR_BLURBS = {
  'Se déplacer': 'Déplacements de personnes et de marchandises, tous modes confondus.',
  'Se loger': 'Rénovation énergétique, chauffage et construction durable du parc bâti.',
  'Préserver': 'Protection de la biodiversité, forêts, sols et milieux naturels.',
  Produire: 'Industrie, énergies et décarbonation des procédés.',
  'Se nourrir': 'Chaîne alimentaire, de la production agricole à la consommation.',
  Consommer: 'Économie circulaire, déchets et modes de consommation.'
}

/** Feuilles de route de l'État citées dans la proposition de refonte. */
const STRATEGIES = [
  { code: 'SNBC 3', label: 'Stratégie bas-carbone', color: '#e4794a' },
  { code: 'PPE', label: "Prog. de l'énergie", color: '#009099' },
  { code: 'PNACC', label: 'Adaptation climat', color: '#b34000' },
  { code: 'SNB 2030', label: 'Biodiversité', color: '#00a95f' },
  { code: 'Plan Eau', label: "", color: '#417dc4' },
  { code: 'PRÉPA', label: "Qualité de l'air", color: '#e1000f' },
  { code: 'Loi AGEC', label: 'Économie circulaire', color: '#a558a0' },
  { code: 'SNANC', label: 'Alimentation', color: '#00aec7' },
  { code: '+', label: 'Restauration nature, forêt, mer…', color: '#3fad46' }
]

/** Corrections d'intitulés relevées sur la taxonomie (cf. relecture). */
const AXE_DISPLAY_NAME_OVERRIDES = {
  'Prévention et le contrôle de la pollution': 'Prévention et contrôle de la pollution'
}

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
  const label = unit ? `${formatted} ${unit}` : formatted
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
  name: 'AboutViewV3',
  components: { EauImg, DsfrPictogram, MiniChart },
  props: {
    useStaging: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      sectorNamesFromApi: [],
      strategies: STRATEGIES,
      spotlightLoading: true,
      etatSpotlights: [],
      chantierSpotlights: []
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
    axeTiles() {
      return IMPACT_AXE_DISPLAY_ORDER.map((name) => {
        const slug = impactAxeSlugFromNomComplet(name)
        const ui = impactAxeUiForSlug(slug) || {}
        return {
          name,
          displayName: AXE_DISPLAY_NAME_OVERRIDES[name] || name,
          slug,
          pictoId: ui.pictoId,
          useEau: !!ui.useEauImage,
        }
      })
    },
    sectorTiles() {
      const names = this.sectorNamesFromApi
      return SECTOR_CARD_DEFS.map((def) => {
        const canonicalName = pickSectorName(def.match, names)
        const shortLabel = def.shortLabel
        const blurb = canonicalName && SECTOR_BLURBS[canonicalName]
          ? SECTOR_BLURBS[canonicalName]
          : 'Synthèse des chantiers et indicateurs pour ce secteur.'
        return {
          shortLabel,
          canonicalName: canonicalName || shortLabel,
          pictoId: def.pictoId,
          blurb
        }
      })
    }
  },
  async mounted() {
    await Promise.all([this.loadSectors(), this.loadSpotlights()])
  },
  methods: {
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
        console.error('Error loading sectors for home V3:', error)
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
        console.error('AboutViewV3 loadSpotlights:', e)
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
    }
  }
}
</script>

<style scoped>
.home-v3 {
  --home-v3-max: 58rem;
  max-width: var(--home-v3-max);
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  box-sizing: border-box;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  font-family: "Marianne", arial, sans-serif;
}

.home-v3 :deep(.fr-text--alt) {
  font-family: "Marianne", arial, sans-serif !important;
}

.home-v3__eyebrow {
  text-align: left;
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #666;
}

.home-v3__eyebrow--pill {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background-color: #ececfe;
  color: #000091;
  letter-spacing: 0.02em;
}

.home-v3__title {
  text-align: left;
  margin-top: 1.5rem;
  margin-bottom: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.25;
}

.home-v3__rosace-wrap {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin: 0;
  padding: 0;
}

.home-v3__rosace {
  width: 100%;
  max-width: min(100%, 21rem);
  height: auto;
  display: block;
}

.home-v3__hero-text {
  text-align: left;
}

.home-v3__hero-text p {
  margin-bottom: 1rem;
  line-height: 1.65;
}

.home-v3__section-title {
  text-align: left;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.home-v3__lead {
  max-width: 40rem;
  margin-bottom: 0;
  line-height: 1.6;
  color: #3a3a3a;
  text-align: left;
}

.home-v3__examples-title {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-weight: 700;
  text-align: left;
}

.home-v3-spotlight {
  height: 100%;
  padding: 1rem;
  box-shadow: inset 0 0 0 1px #e5e5e5;
  background: #fff;
}

/* Cartes "enjeux" / "secteurs" : reprises du style home-tile existant */
.home-v3__cards {
  margin-top: 0.25rem;
}

.home-v3-card {
  display: block;
  height: 100%;
  text-decoration: none;
  color: inherit;
  box-shadow: inset 0 0 0 1px #e5e5e5;
  border-bottom: 4px solid #000091;
  background: #fff;
  transition: background-color 0.15s ease, box-shadow 0.15s ease;
}

.home-v3-card:hover {
  background: #fafafa;
  box-shadow: inset 0 0 0 1px #cfcfcf;
}

.home-v3-card:focus-visible {
  outline: 2px solid #000091;
  outline-offset: 2px;
}

.home-v3-card__body {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  padding: 1.25rem 2.25rem 1.5rem 1.25rem;
  min-height: 9rem;
}

.home-v3-card--rich .home-v3-card__body {
  min-height: 11.5rem;
}

.home-v3-card__picto {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  margin-bottom: 0.75rem;
}

.home-v3-card__picto--eau :deep(.fr-card__img) {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
}

.home-v3-card__heading {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: #161616;
  line-height: 1.35;
  max-width: 100%;
}

.home-v3-card__desc {
  color: #3a3a3a;
  margin: 0.5rem 0 0;
  line-height: 1.45;
  max-width: 100%;
}

.home-v3-card__arrow {
  position: absolute;
  right: 0.875rem;
  bottom: 0.875rem;
  font-size: 1.125rem;
  color: #000091;
}

/* Section 3 : pastilles de stratégies */
.home-v3-strategies {
  list-style: none;
  margin: 1.75rem 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.home-v3-strategy {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: #fff;
  box-shadow: inset 0 0 0 1px #e5e5e5;
  border-left: 4px solid var(--strategy-color, #000091);
  font-size: 0.875rem;
  line-height: 1.3;
}

.home-v3-strategy__code {
  font-weight: 700;
  color: #161616;
  white-space: nowrap;
}

.home-v3-strategy__label {
  color: #3a3a3a;
}

/* Section 3 : statistiques */
.home-v3-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-top: 2.5rem;
}

.home-v3-stat {
  min-width: 9rem;
}

.home-v3-stat__value {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #000091;
  line-height: 1.2;
}

.home-v3-stat__label {
  margin: 0.25rem 0 0;
  color: #3a3a3a;
  font-size: 0.875rem;
  line-height: 1.4;
}

/* Deux colonnes sur petits écrans */
@media (max-width: 767px) {
  .home-v3-card__body {
    padding: 1rem 1.5rem 1.25rem 0.875rem;
  }

  .home-v3-card--rich .home-v3-card__body {
    min-height: 0;
    padding-bottom: 1.75rem;
  }

  .home-v3-card__heading {
    font-size: 0.9375rem;
  }

  .home-v3-card__desc {
    font-size: 0.75rem;
    line-height: 1.4;
  }

  .home-v3-card__picto {
    width: 3rem;
    height: 3rem;
    margin-bottom: 0.5rem;
  }
}
</style>
