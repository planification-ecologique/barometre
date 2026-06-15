<template>
  <div class="home-v3">
    <!-- Hero -->
    <header class="home-v3__hero">
      <p class="home-v3__eyebrow">Le point de départ</p>
      <h1 class="fr-h3 home-v3__title">Réussir simultanément nos transitions écologiques</h1>

      <div class="fr-grid-row fr-grid-row--gutters home-v3__hero-grid">
        <div class="fr-col-12 fr-col-lg-6">
          <figure class="home-v3__rosace-wrap">
            <img
              ref="rosaceImg"
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
            Ces défis systémiques sont interdépendants — et ils nous concernent tous, dans notre façon de nous déplacer, nous loger, nous nourrir.
            Fort de plus de 250 indicateurs, ce baromètre propose une vision quantifiée de ces transitions.
          </p>
          <div
            id="home-v3-hero-intro-region"
            ref="heroIntroClip"
            class="home-v3__hero-intro-clip"
            :class="{ 'home-v3__hero-intro-clip--expanded': heroIntroExpanded }"
            :style="heroIntroClipStyle"
          >
            <div ref="heroIntroInner" class="home-v3__hero-intro-inner">
              <p>
                Entreprises, pouvoirs publics ou citoyens, la transition écologique nous concerne tous. Pour réussir, elle demande de la transparence sur le chemin déjà parcouru et sur celui qui reste à parcourir pour atteindre les objectifs que la France s'est fixés en faveur du climat, de la biodiversité ou encore de la préservation des ressources. C'est l'objet du baromètre de la planification écologique.
              </p>
              <p>
                Fort de plus de 250 indicateurs, ce baromètre propose une vision quantifiée des actions qu'il convient de mener pour accélérer la transition dans les transports, le bâtiment, l'énergie, l'industrie, l'agriculture, l'alimentation, l'eau, les écosystèmes naturels et l'économie circulaire, en les mettant en regard de leurs éventuelles cibles à horizon 2030.
              </p>
              <p>
                Le baromètre de la planification écologique a été conçu pour rendre visibles les stratégies environnementales et faciliter leur suivi lorsqu'elles disposent d'indicateurs ad hoc, voire de cibles. Les indicateurs proposés n'intègrent donc pas les données relatives aux moyens humains ou encore financiers à mettre en œuvre pour les atteindre. De même, les impacts socio-économiques des transformations induites par le dérèglement climatique ne sont pas intégrés à ce baromètre.
              </p>
            </div>
          </div>
          <button
            v-if="heroIntroShowToggle"
            type="button"
            class="fr-btn fr-btn--tertiary-no-outline fr-btn--sm home-v3__hero-read-more fr-mt-1w"
            :aria-expanded="heroIntroExpanded ? 'true' : 'false'"
            aria-controls="home-v3-hero-intro-region"
            @click="toggleHeroIntro"
          >
            {{ heroIntroExpanded ? 'Lire moins' : 'Lire plus' }}
          </button>
        </div>
      </div>
    </header>

    <!-- 1 - Améliorer l'état de l'environnement -->
    <section class="home-v3__section fr-mt-6w" aria-labelledby="v3-enjeux-heading">
      <p class="home-v3__eyebrow home-v3__eyebrow--pill">1 — Améliorer l'état de l'environnement</p>
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
      <p class="home-v3__example fr-text--sm fr-mt-2w">
        <span class="home-v3__example-label">Exemple&nbsp;:</span>
        l'objectif « Atténuation du changement climatique » se mesure notamment au travers de l'évolution des émissions
        de gaz à effet de serre du secteur des transports, suivie dans le baromètre.
      </p>
    </section>

    <!-- 2 - Déployer nos chantiers sectoriels -->
    <section class="home-v3__section fr-mt-6w" aria-labelledby="v3-secteurs-heading">
      <p class="home-v3__eyebrow home-v3__eyebrow--pill">2 — Déployer nos chantiers sectoriels</p>
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
      <p class="home-v3__example fr-text--sm fr-mt-2w">
        <span class="home-v3__example-label">Exemple&nbsp;:</span>
        dans le secteur « Se loger », le chantier de rénovation énergétique des bâtiments contribue à la fois à
        l'atténuation du changement climatique et à la prévention de la pollution.
      </p>
    </section>

    <!-- 3 - Planifier et évaluer -->
    <section class="home-v3__section fr-mt-6w fr-mb-4w" aria-labelledby="v3-strategies-heading">
      <p class="home-v3__eyebrow home-v3__eyebrow--pill">3 — Planifier et évaluer</p>
      <h2 id="v3-strategies-heading" class="fr-h5 home-v3__section-title">Un pilotage unifié des feuilles de route environnementales</h2>
      <p class="home-v3__lead">
        Ce baromètre constitue l'outil central de pilotage qui synthétise les orientations stratégiques de l'État en matière
        d'environnement. Il a été conçu pour rendre visibles les stratégies environnementales et faciliter le suivi de leurs
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
  IMPACT_AXE_DISPLAY_ORDER,
  impactAxeSlugFromNomComplet,
} from '@/services/csvDataService.js'
import { impactAxeUiForSlug } from '@/config/impactAxeUi.js'
import { etatEnvironnementRouteName, chantiersRouteName } from '@/config/routeNames.js'
import { impactAxeNameToSlug } from '@/utils/impactAxeUrl.js'
import { SECTION_SYNTHESE_SLUG } from '@/utils/sectionUrl.js'
import EauImg from '@/components/components_sgv/EauImg.vue'
import DsfrPictogram from '@/components/components_dsfr/DsfrPictogram.vue'

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

function pickSectorName(matchFn, names) {
  return names.find(matchFn) || null
}

export default {
  name: 'AboutViewV3',
  components: { EauImg, DsfrPictogram },
  props: {
    useStaging: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      sectorNamesFromApi: [],
      heroIntroExpanded: false,
      heroIntroMaxHeightPx: null,
      heroIntroShowToggle: false,
      strategies: STRATEGIES
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
    },
    heroIntroClipStyle() {
      if (this.heroIntroExpanded || this.heroIntroMaxHeightPx == null) return {}
      return { maxHeight: `${this.heroIntroMaxHeightPx}px` }
    }
  },
  async mounted() {
    await this.loadSectors()
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
  margin-top: 0;
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

.home-v3__hero-intro-clip {
  overflow: hidden;
  transition: max-height 0.4s ease;
}

@media (prefers-reduced-motion: reduce) {
  .home-v3__hero-intro-clip {
    transition: none;
  }
}

.home-v3__hero-intro-clip--expanded {
  max-height: none !important;
  overflow: visible;
}

.home-v3__hero-text .home-v3__hero-intro-inner p:last-child {
  margin-bottom: 0;
}

.home-v3__hero-read-more {
  display: inline-flex;
  align-self: flex-start;
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

.home-v3__example {
  max-width: 40rem;
  margin-bottom: 0;
  line-height: 1.6;
  color: #3a3a3a;
  text-align: left;
  font-style: italic;
}

.home-v3__example-label {
  font-weight: 700;
  font-style: normal;
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
