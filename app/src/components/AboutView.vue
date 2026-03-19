<template>
  <div class="fr-my-2w">
    <div class="fr-grid-row">
      <article class="fr-col-12">
        <h1 class="fr-title">Le baromètre de la planification écologique</h1>
      </article>
    </div>

    <!-- Liens rapides vers axes et secteurs (équivalents des pages de synthèses) -->
    <div v-if="quickLinksLoaded" class="about-quick-access fr-mt-2w">
      <div class="about-quick-section">
        <span class="about-quick-label">Accès rapide aux axes d'impact</span>
        <div class="about-quick-links">
          <router-link
            v-for="axe in displayAxes"
            :key="'axe-' + axe"
            :to="etatEnvironnementLink(axe)"
            class="about-quick-link"
          >
            → {{ axe }}
          </router-link>
        </div>
      </div>
      <div class="about-quick-section">
        <span class="about-quick-label">Accès rapide aux synthèses sectorielles</span>
        <div class="about-quick-links">
          <router-link
            v-for="sector in displaySectors"
            :key="'sector-' + sector"
            :to="chantiersSectorielsLink(sector)"
            class="about-quick-link"
          >
            → {{ sector }}
          </router-link>
        </div>
      </div>
    </div>

    <div class="fr-mt-4w about-content">
      <p>
        Entreprises, pouvoirs publics ou citoyens, la transition écologique nous concerne tous. Pour réussir, elle demande de la transparence sur le chemin déjà parcouru et sur celui qui reste à parcourir pour atteindre les objectifs que la France s’est fixés en faveur du climat, de la biodiversité ou encore de la préservation des ressources. C'est l'objet du baromètre de la planification écologique.
      </p>

      <p>
        Fort de plus de 250 indicateurs, ce baromètre propose une vision quantifiée des actions qu’il convient de mener pour accélérer la transition dans les transports, le bâtiment, l'énergie, l'industrie, l'agriculture, l'alimentation, l'eau, les écosystèmes naturels et l'économie circulaire, en les mettant en regard de leurs éventuelles cibles à horizon 2030. Sans oublier les données régionales qui sont désormais visualisables lorsque celles-ci sont disponibles, afin de matérialiser les résultats des politiques publiques territoriales.
      </p>

      <p>
        Consulter ce baromètre, c’est appréhender l'ampleur et la complexité des changements à opérer, tout en révélant le caractère réalisable de ces objectifs. Ainsi, les projections présentées sont de deux natures :
      </p>

      <ul>
        <li>la trajectoire tendancielle, qui correspond à une prolongation du rythme observé sur les trois dernières années ;</li>
        <li>et la trajectoire souhaitable pour atteindre ces cibles (dont les sources sont précisées : jalons légaux ou règlementaires, documents de référence ou fichiers techniques non publics), annualisées ou, à défaut, linéarisées depuis 2023, date initiale des travaux de planification écologique et également année de base des budgets carbone du projet de Stratégie nationale bas-carbone.</li>
      </ul>

      <p>
        Fruit d'un travail interministériel essentiel qui va se poursuivre par l’intégration de nouvelles données (implémentation d’indicateurs des futures stratégies nationales, objectifs post-2030…) et de nouveaux enjeux (coordination avec de nouvelles bases, tableaux spécifiques pour certains territoires, notamment ultramarins, etc.), ce baromètre bénéficiera de mises à jour régulières. Les sources sont précisées pour chaque indicateur, avec accès possible aux données brutes.
      </p>

      <div class="fr-callout fr-mt-4w">
        <h2 class="fr-callout__title">Pour aller + loin</h2>
        <p>
          Le baromètre de la planification écologique a vu sa structure approfondie par rapport à sa version précédente, avec l’ajout de plusieurs entrées et niveaux de lecture. En effet, son arborescence reflète désormais la matrice du référentiel de la planification écologique. Véritable outil de pilotage destiné à la sphère publique, ce référentiel propose une vision systémique de nos objectifs de transition puisqu’il compile et met en cohérence des indicateurs pour l’ensemble des stratégies et plans dont s’est dotée la France pour les atteindre (Stratégie nationale pour la biodiversité, Stratégie nationale pour l'alimentation, la nutrition et le climat, Stratégie nationale bas-carbone…). Et ce, en croisant :
        </p>
        <ul>
          <li>les impacts environnementaux visés sur chacun des six objectifs environnementaux de la taxonomie européenne ;</li>
          <li>les transformations tangibles mises en œuvre pour atteindre ces objectifs, les leviers, regroupés en chantiers, dans chacun des secteurs.</li>
        </ul>
        <p>
          Ainsi, pour chaque engagement de la France pris à l’échelle européenne, plusieurs chantiers sectoriels sont mis en œuvre avec des leviers concrets pour les matérialiser. Référentiel comme baromètre partagent ainsi un double objectif de pédagogie et d’évaluation, appuyé par des principes et indicateurs tangibles, pour une appropriation de la transition écologique par tous, sans obérer son caractère parfois complexe et multifactoriel.
        </p>
      </div>

      <p class="fr-mt-4w">
        <a href="https://www.planification-ecologique.gouv.fr" class="fr-link" target="_blank" rel="noopener">
          En savoir plus sur la planification écologique
        </a>
      </p>
    </div>
  </div>
</template>

<script>
import { getNavigationStructure, IMPACT_AXE_DISPLAY_ORDER } from '@/services/csvDataService.js'

export default {
  name: "AboutView",
  props: {
    params: {
      type: Object,
      default: () => ({}),
    },
    useStaging: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      quickLinksLoaded: false,
      displayAxes: [],
      displaySectors: []
    }
  },
  async mounted() {
    await this.loadQuickLinks()
  },
  methods: {
    slugify(str) {
      return String(str).toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    },
    async loadQuickLinks() {
      try {
        const environment = this.useStaging ? 'staging' : 'production'
        const response = await getNavigationStructure(environment)
        if (response.status === 'success' && response.data?.sectors) {
          this.displayAxes = [...IMPACT_AXE_DISPLAY_ORDER]
          this.displaySectors = response.data.sectors
            .filter(s => s.name !== 'Synthèse')
            .map(s => s.name)
          this.quickLinksLoaded = true
        }
      } catch (error) {
        console.error('Error loading quick links:', error)
      }
    },
    etatEnvironnementLink(axe) {
      const base = { name: this.routeName, query: { sector: 'Synthèse', view: 'etat-environnement' } }
      return { ...base, hash: '#axe-' + this.slugify(axe) }
    },
    chantiersSectorielsLink(sector) {
      const base = { name: this.routeName, query: { sector: 'Synthèse', view: 'chantiers-sectoriels' } }
      return { ...base, hash: '#sector-' + this.slugify(sector) }
    }
  },
  computed: {
    routeName() {
      return window.location.pathname.includes('/staging') ? 'staging-dashboard' : 'dashboard'
    }
  }
};
</script>

<style scoped>
.fr-title {
  margin-bottom: 0.625rem;
}

.about-content {
  max-width: 800px;
}

.about-content p {
  margin-bottom: 1.5rem;
  line-height: 1.7;
}

/* Liens rapides - même structure que EtatEnvironnement et SyntheseSectorielle */
.about-quick-access {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.about-quick-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.about-quick-label {
  font-size: 0.875rem;
  color: #3a3a3a;
}

.about-quick-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.about-quick-link {
  background: transparent;
  border: 1px solid #000091;
  border-radius: 999px;
  color: #000091;
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.3;
  padding: 0.3rem 0.875rem;
  text-decoration: none;
  white-space: nowrap;
  transition: background-color 0.15s, color 0.15s;
}

.about-quick-link:hover {
  background: #000091;
  color: #fff;
  text-decoration: none;
}
</style>
