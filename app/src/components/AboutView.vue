<template>
  <div class="home-landing">
    <!-- Hero -->
    <header class="home-hero">
      <h1 class="fr-h3 home-hero__title">Le baromètre de la planification écologique</h1>
      <figure class="home-hero__visual">
        <img
          class="home-hero__rosace fr-responsive-img"
          :src="rosaceSrc"
          alt="Schéma France Nation Verte : cinq enjeux environnementaux au centre, six thématiques et leurs chantiers opérationnels autour."
          width="720"
          height="720"
          loading="eager"
          decoding="async"
        />
      </figure>
      <div class="home-hero__intro">
        <p>
          Entreprises, pouvoirs publics ou citoyens, la transition écologique nous concerne tous. Pour réussir, elle demande de la transparence sur le chemin déjà parcouru et sur celui qui reste à parcourir pour atteindre les objectifs que la France s’est fixés en faveur du climat, de la biodiversité ou encore de la préservation des ressources. C'est l'objet du baromètre de la planification écologique.
        </p>
        <p>
          Fort de plus de 250 indicateurs, ce baromètre propose une vision quantifiée des actions qu’il convient de mener pour accélérer la transition dans les transports, le bâtiment, l'énergie, l'industrie, l'agriculture, l'alimentation, l'eau, les écosystèmes naturels et l'économie circulaire, en les mettant en regard de leurs éventuelles cibles à horizon 2030.
        </p>
      </div>
    </header>

    <!-- État de l'environnement -->
    <section class="home-section fr-mt-6w" aria-labelledby="home-etat-heading">
      <h2 id="home-etat-heading" class="fr-h5 home-section__title">État de l'environnement</h2>
      <p class="home-section__lead">
        L'amélioration de l'état de l'environnement constitue la finalité des stratégies environnementales. 
        Les indicateurs sont regroupés par axe de la taxonomie européenne : atténuation, adaptation, eau, économie circulaire, pollution, biodiversité. 
        Pour l'axe de l'adaptation au changement climatique, les méthodes d'évaluation quantitative qui en découlent font défaut, 
        d'où le manque d'indicateurs dans ce baromètre, dans l'attente de travaux en cours.
      </p>
      <router-link
        :to="{ name: etatRouteName, query: { section: syntheseSection } }"
        class="fr-btn fr-btn--primary fr-btn--sm fr-mt-2w fr-mb-3w"
      >
        Voir la synthèse
      </router-link>
      <div class="fr-grid-row fr-grid-row--gutters home-tiles">
        <div
          v-for="axe in axeTiles"
          :key="'axe-' + axe.name"
          class="fr-col-6 fr-col-md-4"
        >
          <router-link
            :to="etatEnvironnementLink(axe.name)"
            class="home-tile"
          >
            <div class="home-tile__body">
              <div class="home-tile__picto" :class="{ 'home-tile__picto--eau': axe.useEau }">
                <eau-img v-if="axe.useEau" width="56px" height="56px" />
                <dsfr-pictogram v-else-if="axe.pictoId" :picto-id="axe.pictoId" :size="56" />
              </div>
              <h3 class="home-tile__heading">{{ axe.name }}</h3>
              <span class="fr-icon-arrow-right-line home-tile__arrow" aria-hidden="true" />
            </div>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Chantiers sectoriels -->
    <section class="home-section fr-mt-6w fr-mb-4w" aria-labelledby="home-chantiers-heading">
      <h2 id="home-chantiers-heading" class="fr-h5 home-section__title">Chantiers sectoriels</h2>
      <p class="home-section__lead">
        Les chantiers structurent les transformations tangibles prévues par les stratégies environnementales pour atteindre ces objectifs, secteur par secteur.
      </p>
      <router-link
        :to="{ name: chantiersRouteName, query: { section: syntheseSection } }"
        class="fr-btn fr-btn--primary fr-btn--sm fr-mt-2w fr-mb-3w"
      >
        Voir la synthèse
      </router-link>
      <div class="fr-grid-row fr-grid-row--gutters home-tiles">
        <div
          v-for="item in sectorTiles"
          :key="'sector-' + item.canonicalName"
          class="fr-col-6 fr-col-md-4"
        >
          <router-link
            :to="chantiersSectorielsLink(item.canonicalName)"
            class="home-tile home-tile--rich"
          >
            <div class="home-tile__body">
              <div class="home-tile__picto">
                <dsfr-pictogram :picto-id="item.pictoId" :size="56" />
              </div>
              <h3 class="home-tile__heading">{{ item.shortLabel }}</h3>
              <p class="home-tile__desc fr-text--sm">{{ item.blurb }}</p>
              <span class="fr-icon-arrow-right-line home-tile__arrow" aria-hidden="true" />
            </div>
          </router-link>
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

function pickSectorName(matchFn, names) {
  return names.find(matchFn) || null
}

export default {
  name: 'AboutView',
  components: { EauImg, DsfrPictogram },
  props: {
    params: {
      type: Object,
      default: () => ({})
    },
    useStaging: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      sectorNamesFromApi: []
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
    await this.loadSectors()
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
/* Colonne étroite type maquette / Figma (contenu centré, pas pleine largeur fluide) */
.home-landing {
  --home-max: 47.5rem;
  max-width: var(--home-max);
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  box-sizing: border-box;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  font-family: "Marianne", arial, sans-serif;
}

/* DSFR .fr-text--alt uses Spectral; keep Marianne for the whole landing */
.home-landing :deep(.fr-text--alt) {
  font-family: "Marianne", arial, sans-serif !important;
}

.home-hero__title {
  text-align: center;
  margin-top: 1.5rem;
  margin-bottom: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.25;
}

.home-hero__visual {
  display: flex;
  justify-content: center;
  margin: 0.75rem 0 1.5rem;
  padding: 0;
  border: none;
}

.home-hero__rosace {
  width: 100%;
  max-width: min(100%, 21rem);
  height: auto;
  display: block;
}

.home-hero__intro,
.home-section__lead {
  font-size: 1rem;
  line-height: 1.65;
}

.home-hero__intro {
  text-align: left;
  width: 100%;
}

.home-hero__intro p {
  text-align: left;
  margin-bottom: 1rem;
}

.home-section__title {
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.home-section__lead {
  margin-bottom: 0;
  color: #3a3a3a;
}

.home-tiles {
  margin-top: 0.25rem;
}

.home-tile {
  display: block;
  height: 100%;
  text-decoration: none;
  color: inherit;
  box-shadow: inset 0 0 0 1px #e5e5e5;
  border-bottom: 4px solid #000091;
  background: #fff;
  transition: background-color 0.15s ease, box-shadow 0.15s ease;
}

.home-tile:hover {
  background: #fafafa;
  box-shadow: inset 0 0 0 1px #cfcfcf;
}

.home-tile:focus-visible {
  outline: 2px solid #000091;
  outline-offset: 2px;
}

.home-tile__body {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.25rem 2.25rem 1.5rem 1rem;
  min-height: 8.5rem;
}

.home-tile--rich .home-tile__body {
  min-height: 11.5rem;
  align-items: center;
}

.home-tile__picto {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  margin-bottom: 0.625rem;
}

.home-tile__picto--eau :deep(.fr-card__img) {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
}

.home-tile__heading {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: #161616;
  line-height: 1.35;
  max-width: 100%;
}

.home-tile__desc {
  color: #3a3a3a;
  margin: 0.5rem 0 0;
  line-height: 1.45;
  max-width: 100%;
}

.home-tile__arrow {
  position: absolute;
  right: 0.75rem;
  bottom: 0.75rem;
  font-size: 1.125rem;
  color: #000091;
}

/* Two columns on small screens: tighter tiles so text stays readable */
@media (max-width: 767px) {
  .home-tile__body {
    padding: 1rem 1.5rem 1.25rem 0.625rem;
  }

  .home-tile--rich .home-tile__body {
    min-height: 0;
    padding-bottom: 1.75rem;
  }

  .home-tile__heading {
    font-size: 0.9375rem;
  }

  .home-tile__desc {
    font-size: 0.75rem;
    line-height: 1.4;
  }

  .home-tile__picto {
    width: 3.25rem;
    height: 3.25rem;
    margin-bottom: 0.5rem;
  }
}
</style>
