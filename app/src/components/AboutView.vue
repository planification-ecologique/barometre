<template>
  <div class="home">
    <!-- Hero -->
    <header class="home__hero">
      <h1 class="fr-h3 home__title">Réussir simultanément nos transitions écologiques</h1>

      <div class="fr-grid-row fr-grid-row--gutters home__hero-grid">
        <div class="fr-col-12 fr-col-lg-6">
          <figure class="home__rosace-wrap">
            <img
              class="home__rosace fr-responsive-img"
              :src="rosaceSrc"
              alt="Schéma France Nation Verte : cinq enjeux environnementaux au centre, six thématiques et leurs chantiers opérationnels autour."
              width="720"
              height="720"
              loading="eager"
              decoding="async"
            />
          </figure>
        </div>
        <div class="fr-col-12 fr-col-lg-6 home__hero-text fr-text--md">
          <p>
            Réduire nos émissions, s'adapter au climat qui change, protéger l'eau et la nature, préserver nos ressources, moins polluer.
            Ces défis systémiques sont interdépendants - et ils nous concernent tous, dans notre façon de nous déplacer, nous loger, nous nourrir...
            Fort de plus de 250 indicateurs, ce baromètre propose une vision quantifiée de ces transitions.
          </p>
          <p>
            Les cibles affichées ne constituent pas systématiquement des engagements formels, mais donnent une indication sur les points de passage cohérents avec les stratégies environnementales.
            Les données alimentant les indicateurs proviennent de sources diverses, disponibles à des niveaux variables de fréquence de mise à jour ou de granularité. Les sources et précisions méthodologiques sont données en commentaire pour chaque indicateur.
          </p>
        </div>
      </div>
    </header>

    <!-- 1 - Planifier et évaluer -->
    <section class="home__section fr-mt-6w" aria-labelledby="home-strategies-heading">
      <p class="home__eyebrow home__eyebrow--pill">1 - Planifier et évaluer</p>
      <h2 id="home-strategies-heading" class="fr-h5 home__section-title">Un suivi unifié des feuilles de route environnementales</h2>
      <p class="home__lead">
        Ce baromètre constitue l'outil central de transparence en matière d'environnement.
        Il synthétise les stratégies environnementales avec une structure homogène afin de rendre plus visibles leurs objectifs et de suivre leurs résultats.
      </p>
      <p class="home__note fr-text--sm">
        Les indicateurs proposés n'intègrent donc pas les données relatives aux moyens humains ou encore financiers
        à mettre en œuvre pour les atteindre. De même, les impacts socio-économiques des transformations induites par le
        dérèglement climatique ne sont pas intégrés à ce baromètre.
      </p>

      <ul class="home-strategies" role="list">
        <li v-for="strategy in strategies" :key="strategy.href" class="home-strategies__item">
          <a
            :href="strategy.href"
            class="home-strategy home-strategy--link"
            :style="{ '--strategy-color': strategy.color }"
            :title="strategy.title || undefined"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="home-strategy__code">{{ strategy.code }}</span>
            <span v-if="strategy.label" class="home-strategy__label">{{ strategy.label }}</span>
          </a>
        </li>
      </ul>

      <div class="home-stats">
        <div class="home-stat">
          <p class="home-stat__value">130+</p>
          <p class="home-stat__label">leviers d'action recensés</p>
        </div>
        <div class="home-stat">
          <p class="home-stat__value">6</p>
          <p class="home-stat__label">enjeux croisés avec 6 secteurs</p>
        </div>
        <div class="home-stat">
          <p class="home-stat__value">1</p>
          <p class="home-stat__label">cadre commun de lecture</p>
        </div>
      </div>
    </section>

    <!-- 2 - Améliorer l'état de l'environnement -->
    <section class="home__section fr-mt-6w" aria-labelledby="home-enjeux-heading">
      <p class="home__eyebrow home__eyebrow--pill">2 - Améliorer l'état de l'environnement</p>
      <h2 id="home-enjeux-heading" class="fr-h5 home__section-title">6 grands objectifs stratégiques</h2>
      <p class="home__lead">
        L'amélioration concrète de l'état de l'environnement constitue la finalité des stratégies environnementales et des politiques publiques associées.
        Pour mesurer sa réussite, ce baromètre est structuré autour des 6 objectifs environnementaux de la France,
        issus de la taxonomie européenne.
      </p>
      <router-link
        :to="{ name: etatRouteName, query: { section: syntheseSection } }"
        class="fr-btn fr-btn--primary fr-btn--sm fr-mt-2w fr-mb-3w"
      >
        Voir la synthèse
      </router-link>
      <div class="fr-grid-row fr-grid-row--gutters home__cards">
        <div
          v-for="axe in axeTiles"
          :key="'home-axe-' + axe.name"
          class="fr-col-12 fr-col-md-4"
        >
          <router-link :to="etatEnvironnementLink(axe.name)" class="home-card">
            <div class="home-card__body">
              <div class="home-card__picto" :class="{ 'home-card__picto--eau': axe.useEau }">
                <eau-img v-if="axe.useEau" width="56px" height="56px" />
                <dsfr-pictogram v-else-if="axe.pictoId" :picto-id="axe.pictoId" :size="56" />
              </div>
              <h3 class="home-card__heading">{{ axe.displayName }}</h3>
              <span class="fr-icon-arrow-right-line home-card__arrow" aria-hidden="true" />
            </div>
          </router-link>
        </div>
      </div>
      <h3 class="fr-h6 home__examples-title">Exemples d'indicateurs d'état de l'environnement</h3>
      <p v-if="spotlightLoading" class="fr-text--sm fr-text-mention--grey">
        Chargement aléatoire d'indicateurs parmi la synthèse…
      </p>
      <template v-else>
        <p v-if="etatSpotlights.length > 0" class="home__examples-lead fr-text--sm">
          Voici deux indicateurs choisis de manière aléatoire parmi nos indicateurs d'état de l'environnement.
        </p>
        <p v-else class="fr-text--sm">Aucun indicateur graphique disponible pour l'aperçu.</p>
        <div v-if="etatSpotlights.length > 0" class="fr-grid-row fr-grid-row--gutters home-spotlights">
          <div
            v-for="card in etatSpotlights"
            :key="'etat-spot-' + card.raw.id_indic"
            class="fr-col-12 fr-col-md-6"
          >
            <div class="home-spotlight">
              <ul class="fr-badges-group fr-badges-group--sm fr-mb-1w">
                <li>
                  <p class="fr-badge fr-badge--sm fr-badge--info">{{ card.contextLabel }}</p>
                </li>
              </ul>
              <mini-chart :data-obj="card.raw" detailed />
            </div>
          </div>
        </div>
      </template>
    </section>

    <!-- 3 - Déployer nos chantiers sectoriels -->
    <section class="home__section fr-mt-6w fr-mb-4w" aria-labelledby="home-secteurs-heading">
      <p class="home__eyebrow home__eyebrow--pill">3 - Déployer nos chantiers sectoriels</p>
      <h2 id="home-secteurs-heading" class="fr-h5 home__section-title">Des transformations tangibles de notre quotidien</h2>
      <p class="home__lead">
        L'atteinte de nos objectifs environnementaux impose le déploiement de transformations concrètes, structurées par grands
        secteurs d'activité. Chaque secteur fait l'objet de chantiers organisant ces transformations.
      </p>
      <router-link
        :to="{ name: chantiersRouteName, query: { section: syntheseSection } }"
        class="fr-btn fr-btn--primary fr-btn--sm fr-mt-2w fr-mb-3w"
      >
        Voir la synthèse
      </router-link>
      <div class="fr-grid-row fr-grid-row--gutters home__cards">
        <div
          v-for="item in sectorTiles"
          :key="'home-sector-' + item.canonicalName"
          class="fr-col-12 fr-col-md-4"
        >
          <router-link :to="chantiersSectorielsLink(item.canonicalName)" class="home-card home-card--rich">
            <div class="home-card__body">
              <div class="home-card__picto">
                <dsfr-pictogram :picto-id="item.pictoId" :size="56" />
              </div>
              <h3 class="home-card__heading">{{ item.shortLabel }}</h3>
              <p class="home-card__desc fr-text--sm">{{ item.blurb }}</p>
              <span class="fr-icon-arrow-right-line home-card__arrow" aria-hidden="true" />
            </div>
          </router-link>
        </div>
      </div>
      <h3 class="fr-h6 home__examples-title">Exemples d'indicateurs des chantiers sectoriels</h3>
      <p v-if="spotlightLoading" class="fr-text--sm fr-text-mention--grey">
        Chargement aléatoire d'indicateurs parmi les chantiers…
      </p>
      <template v-else>
        <p v-if="chantierSpotlights.length > 0" class="home__examples-lead fr-text--sm">
          Voici deux indicateurs choisis de manière aléatoire parmi nos indicateurs de chantiers sectoriels.
        </p>
        <p v-else class="fr-text--sm">Aucun indicateur de chantier graphique disponible pour l'aperçu.</p>
        <div v-if="chantierSpotlights.length > 0" class="fr-grid-row fr-grid-row--gutters home-spotlights">
          <div
            v-for="card in chantierSpotlights"
            :key="'chantier-spot-' + card.raw.id_indic"
            class="fr-col-12 fr-col-md-6"
          >
            <div class="home-spotlight">
              <ul class="fr-badges-group fr-badges-group--sm fr-mb-1w">
                <li>
                  <p class="fr-badge fr-badge--sm fr-badge--info">{{ card.contextLabel }}</p>
                </li>
                <li v-if="card.chantierLabel">
                  <p class="fr-badge fr-badge--sm fr-badge--purple-glycine">{{ card.chantierLabel }}</p>
                </li>
              </ul>
              <mini-chart :data-obj="card.raw" detailed />
            </div>
          </div>
        </div>
      </template>
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
import { indicatorAuxChartLegend } from '@/utils/synthesisChartLegend.js'
import { fetchDocumentReferenceData } from '@/services/gristDataFetcher.js'
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

/** Couleurs optionnelles par nom court Grist. */
const STRATEGY_COLOR_BY_SHORT = {
  SNBC: '#e4794a',
  PPE: '#009099',
  PNACC: '#b34000',
  SNB: '#00a95f',
  'Plan eau': '#417dc4',
  PREPA: '#e1000f',
  'Loi AGEC': '#a558a0',
  SNANC: '#00aec7',
  LTECV: '#7e57c2',
  RRN: '#3fad46',
  LEMA: '#5b8ff9'
}

const STRATEGY_DEFAULT_COLOR = '#666666'

function buildHomeStrategies(docRows) {
  const items = []
  const seenShortName = new Set()
  for (const row of docRows || []) {
    const shortName = String(row['Nom court'] ?? '').trim()
    const href = String(row['Lien vers document'] ?? '').trim()
    if (!shortName || !href || seenShortName.has(shortName)) continue
    seenShortName.add(shortName)

    const documentName = String(row.Document ?? '').trim()
    const theme = String(row['Thème'] ?? row.Theme ?? '').trim()

    items.push({
      code: shortName,
      label: theme,
      color: STRATEGY_COLOR_BY_SHORT[shortName] || STRATEGY_DEFAULT_COLOR,
      href,
      title: documentName || undefined
    })
  }
  return items
}

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

function hasDefinedTarget(ind) {
  return indicatorAuxChartLegend(ind).showTarget
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
  name: 'AboutView',
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
      strategies: [],
      spotlightLoading: true,
      etatSpotlights: [],
      chantierSpotlights: [],
      etatSpotlightPoolSize: 0,
      chantierSpotlightPoolSize: 0
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
    await Promise.all([this.loadSectors(), this.loadStrategies(), this.loadSpotlights()])
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
        console.error('Error loading sectors for home:', error)
      }
    },
    async loadStrategies() {
      try {
        const docs = await fetchDocumentReferenceData()
        this.strategies = buildHomeStrategies(docs)
      } catch (error) {
        console.error('Error loading strategies for home:', error)
      }
    },
    async loadSpotlights() {
      this.spotlightLoading = true
      this.etatSpotlights = []
      this.chantierSpotlights = []
      this.etatSpotlightPoolSize = 0
      this.chantierSpotlightPoolSize = 0
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
            if (!hasDefinedTarget(ind)) continue
            const axeLabel = gristToAxe[String(ind.id_indic)] || 'Axe d’impact'
            etatPool.push({
              raw: ind,
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
            if (!hasDefinedTarget(ind)) continue
            const meta = chantierByGrist[String(ind.id_indic)]
            if (!meta) continue
            chantierPool.push({
              raw: ind,
              contextLabel: meta.sectorName,
              chantierLabel: meta.chantierName
            })
          }
        }

        this.etatSpotlightPoolSize = etatPool.length
        this.chantierSpotlightPoolSize = chantierPool.length
        this.etatSpotlights = pickRandomUnique(etatPool, SPOTLIGHT_COUNT)
        this.chantierSpotlights = pickRandomUnique(chantierPool, SPOTLIGHT_COUNT)
      } catch (e) {
        console.error('AboutView loadSpotlights:', e)
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
.home {
  --home-max: 58rem;
  max-width: var(--home-max);
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  box-sizing: border-box;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  font-family: "Marianne", arial, sans-serif;
}

.home :deep(.fr-text--alt) {
  font-family: "Marianne", arial, sans-serif !important;
}

.home__eyebrow {
  text-align: left;
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #666;
}

.home__eyebrow--pill {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background-color: #ececfe;
  color: #000091;
  letter-spacing: 0.02em;
}

.home__title {
  text-align: left;
  margin-top: 1.5rem;
  margin-bottom: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.25;
}

.home__rosace-wrap {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  margin: 0;
  padding: 0;
}

.home__rosace {
  width: 100%;
  max-width: min(100%, 21rem);
  height: auto;
  display: block;
}

.home__hero-text {
  text-align: left;
}

.home__hero-text p {
  margin-bottom: 1rem;
  line-height: 1.65;
}

.home__section-title {
  text-align: left;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.home__lead {
  max-width: 40rem;
  margin-bottom: 0;
  line-height: 1.6;
  color: #3a3a3a;
  text-align: left;
}

.home__note {
  max-width: 40rem;
  margin-top: 0.5rem;
  margin-bottom: 0;
  line-height: 1.5;
  color: #666;
  text-align: left;
}

.home__examples-title {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-weight: 700;
  text-align: left;
}

.home__examples-lead {
  margin: 0 0 1rem;
  color: #666;
}

.home-spotlight {
  height: 100%;
  padding: 1rem;
  box-shadow: inset 0 0 0 1px #e5e5e5;
  background: #fff;
}

.home-spotlight :deep(.fr-badges-group) {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}

.home-spotlight :deep(.fr-badge) {
  white-space: normal;
}

/* Cartes "enjeux" / "secteurs" : reprises du style home-tile existant */
.home__cards {
  margin-top: 0.25rem;
}

.home-card {
  display: block;
  height: 100%;
  text-decoration: none;
  color: inherit;
  box-shadow: inset 0 0 0 1px #e5e5e5;
  border-bottom: 4px solid #000091;
  background: #fff;
  transition: background-color 0.15s ease, box-shadow 0.15s ease;
}

.home-card:hover {
  background: #fafafa;
  box-shadow: inset 0 0 0 1px #cfcfcf;
}

.home-card:focus-visible {
  outline: 2px solid #000091;
  outline-offset: 2px;
}

.home-card__body {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  padding: 1.25rem 2.25rem 1.5rem 1.25rem;
  min-height: 9rem;
}

.home-card--rich .home-card__body {
  min-height: 11.5rem;
}

.home-card__picto {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  margin-bottom: 0.75rem;
}

.home-card__picto--eau :deep(.fr-card__img) {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
}

.home-card__heading {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: #161616;
  line-height: 1.35;
  max-width: 100%;
}

.home-card__desc {
  color: #3a3a3a;
  margin: 0.5rem 0 0;
  line-height: 1.45;
  max-width: 100%;
}

.home-card__arrow {
  position: absolute;
  right: 0.875rem;
  bottom: 0.875rem;
  font-size: 1.125rem;
  color: #000091;
}

/* Section 3 : pastilles de stratégies */
.home-strategies {
  list-style: none;
  margin: 1.75rem 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.home-strategies__item {
  margin: 0;
}

.home-strategy {
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

.home-strategy--link {
  text-decoration: none;
  color: inherit;
  transition: background-color 0.15s ease, box-shadow 0.15s ease;
  --underline-img: none;
  background-image: none;
}

.home-strategy--link:hover {
  background: #fafafa;
  box-shadow: inset 0 0 0 1px #cfcfcf;
}

.home-strategy--link:focus-visible {
  outline: 2px solid #000091;
  outline-offset: 2px;
}

.home-strategy--link::after {
  margin-left: auto;
}

.home-strategy__code {
  font-weight: 700;
  color: #161616;
  white-space: nowrap;
}

.home-strategy__label {
  color: #3a3a3a;
}

/* Section 3 : statistiques */
.home-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-top: 2.5rem;
}

.home-stat {
  min-width: 9rem;
}

.home-stat__value {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #000091;
  line-height: 1.2;
}

.home-stat__label {
  margin: 0.25rem 0 0;
  color: #3a3a3a;
  font-size: 0.875rem;
  line-height: 1.4;
}

/* Deux colonnes sur petits écrans */
@media (max-width: 767px) {
  .home-card__body {
    padding: 1rem 1.5rem 1.25rem 0.875rem;
  }

  .home-card--rich .home-card__body {
    min-height: 0;
    padding-bottom: 1.75rem;
  }

  .home-card__heading {
    font-size: 0.9375rem;
  }

  .home-card__desc {
    font-size: 0.75rem;
    line-height: 1.4;
  }

  .home-card__picto {
    width: 3rem;
    height: 3rem;
    margin-bottom: 0.5rem;
  }
}
</style>
