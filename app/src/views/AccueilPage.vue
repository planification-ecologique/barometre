<template>
  <div class="fr-container--fluid">
    <div class="fr-grid-row">
      <div class="fr-col">
        <card-img-box :cardObject=cardIntro></card-img-box>
      </div>
    </div>
    <div class="fr-grid-row">
      <div class="fr-col">
        <card-img-box :cardObject=cardObjectif></card-img-box>
      </div>
    </div>    
    <div class="fr-grid-row">
      <div class="fr-col">
        <card-img-box :cardObject=cardTrajectoire></card-img-box>
      </div>
    </div>   
    <div class="fr-grid-row">
      <div class="fr-col">
        <card-img-box :cardObject=cardEvolution></card-img-box>
      </div>
    </div>   
      <div class="fr-grid-row">
      <div class="fr-col">
        <card-img-box :cardObject=cardPerimetre></card-img-box>
      </div>
    </div> 
      <div class="fr-grid-row">
      <div class="fr-col">
        <card-img-box :cardObject=cardAmbition></card-img-box>
      </div>
    </div> 
  
  </div>
</template>

<script>

import CardImgBox from '../components/CardImgBox.vue'
import UpFooter from '../components/UpFooter.vue'
import { dsfrAnalytics } from '../services/dsfr_analytics' 

/* Import des images */
import ChartBarImg from '../components/components_sgv/ChartBarImg.vue'
import GoalImg from '../components/components_sgv/GoalImg.vue'
import TrajectoireImg from '../components/components_sgv/TrajectoireImg.vue'
import FranceImg from '../components/components_sgv/FranceImg.vue'
import DocumentDownloadImg from '../components/components_sgv/DocumentDownloadImg.vue'
import EnvironnementImg from '../components/components_sgv/EnvironnementImg.vue'
import DataVisualization from '../components/components_sgv/DataVisualization.vue'
import LimitesImg from '../components/components_sgv/LimitesImg.vue'

export default {
  name: 'Secret',
  components: {
    CardImgBox,
    UpFooter,
    ChartBarImg,
    GoalImg,
    TrajectoireImg,
    FranceImg,
    DocumentDownloadImg,
    EnvironnementImg,
    DataVisualization,
    LimitesImg,
    TrajectoireImg

},
  data() {
    return {
      querySuccess: true,

      footerData: {
        bgColor: "#F5F5FE",
      },
      cardIntro: {
        title: "9 volets",
        description : "Cette version 1 numérique du tableau de bord succède à l’infogram (V0) et présente des indicateurs de la planification écologique répartis entre 9 volets (Transverse, Transports, Bâtiments, Energie, Industrie, Agriculture-alimentation, Eau, Ecosystèmes, Economie circulaire).",
        databtn: true,
        // btnUrl:"https://www.google.fr/",
        // databtn1: true,
        bgcolor: "#F5F5FE",
        image: DocumentDownloadImg,
        // image: FranceImg
      },
      cardObjectif: {
        title: "Objectif des indicateurs",
        description : "Ces indicateurs visent à représenter l'évolution des dernières années et à partager les perspectives concernant les grands leviers d'action de la planification écologique, afin d'éclairer tous les acteurs concernés et contribuer à la discussion collective sur les chemins de transition appropriés pour le pays.",
        databtn: false,
        databtn1: true,
        image: DataVisualization,

      },
      cardTrajectoire: {
        title: "Limites et prochaines étapes",
        description : "Ils ne prétendent pas à une vision exhaustive, l'outil ayant vocation à être enrichi au fur et à mesure de l'avancée des travaux et en fonction des retours des utilisateurs. En particulier, une version élargie sera élaborée d'ici l'été 2024, notamment pour inclure les enjeux relatifs à l'adaptation aux conséquences du changement climatique. Le travail est également en cours afin de prolonger les trajectoires au-delà de 2030. A ce prototype devrait succéder, dans les prochaines semaines, une version web aux fonctionnalités plus développées.",
        databtn: false,
        bgcolor: "#F5F5FE",
        databtn1: true,
        image: LimitesImg,
      },
      cardEvolution: {
        title: "Trajectoires futures",
        description : `Il importe de souligner également que les trajectoires affichées pour l’avenir reposent parfois sur des objectifs officiels, mais parfois aussi, et même souvent, sur des hypothèses techniques de travail à date ; elles pourront donc évoluer le cas échéant et n'engagement pas en tant que tel la responsabilité ni du SGPE ni a fortiori du gouvernement. Pour autant, les trajectoires présentées cherchent à donner une vision cohérente des grandes stratégies nationales existantes (ex. Stratégie nationale pour la biodiversité) ou en cours de finalisation (ex. Stratégie nationale bas carbone).`,
        databtn: false,
        databtn1: true,
        image: TrajectoireImg,

      },
        cardPerimetre: {
        title: "Périmètre géographique",
        description : `Par ailleurs, un grand nombre de ces indicateurs ne concernent que l’Hexagone, faute notamment de données disponibles. Un travail spécifique sera mené au cours de l’année pour bâtir les indicateurs adéquats correspondant aux spécificités ultra-marines. Dans ce contexte, il sera important de distinguer chacun des territoires ultramarins et de les placer dans leur contexte singulier, par rapport aux autres territoires d’outre-mer, mais aussi en comparaison avec l’Hexagone et dans le contexte de leur bassin géographique.`,
        databtn: false,
        databtn1: true,
        bgcolor: "#F5F5FE",
        image: FranceImg,


      },
        cardAmbition: {
        title: "Ambition",
        description : `Plus généralement, si les données affichées à ce jour se cantonnent au niveau national, l'ambition est de permettre, dans les versions futures du Tableau de bord, l'accès à des données désagrégées aux différents niveaux territoriaux. Toutes les données correspondantes seront mises en libre accès pour les utilisateurs.`,
        databtn: false,
        databtn1: true,
        image: EnvironnementImg,


      },
    }
  },
  mounted () {
    dsfrAnalytics({
        path: '/accueil',
        title: 'Toutes les données des sites en .gouv.fr en un coup d’œiluentation des sites internet de l’État',
        name: 'Accueil',
        theme: 'Accueil'
    })
  }
}
</script>
  
<style>

.flex-container {
  max-width: none;
  overflow: hidden;
}

.fr-background-color {
  background-color: #F5F5FE;
}

 .fr-card:hover .fr-card__image,
  .fr-card:hover .fr-card__content {
    box-shadow: none; /* Supprime l'ombre au survol */
    transform: none; /* Supprime toute transformation au survol */
  }

</style>
