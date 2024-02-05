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
      <div class="fr-col fr-py-md-5w fr-px-29v fr-background-color">
        <up-footer :footerObject=footerData></up-footer>
      </div>
    </div>   
  
  </div>
</template>

<script>

import CardImgBox from '../components/CardImgBox.vue'
import UpFooter from '../components/UpFooter.vue'

/* Import des images */
import ChartBarImg from '../components/components_sgv/ChartBarImg.vue'
import GoalImg from '../components/components_sgv/GoalImg.vue'
import TrajectoireImg from '../components/components_sgv/TrajectoireImg.vue'

export default {
  name: 'Secret',
  components: {
    CardImgBox,
    UpFooter,
    ChartBarImg,
    GoalImg,
    TrajectoireImg

},
  data() {
    return {
      querySuccess: true,

      footerData: {
        bgColor: "#F5F5FE",
      },
      cardIntro: {
        title: "Introduction",
        description : "Le prototype béta du tableau de bord ci-dessous présente des indicateurs de la planification écologique pour 9 volets différents (Transverse, Transports, Bâtiments, Energie, Industrie, Agriculture-alimentation, Eau, Ecosystèmes, Economie circulaire), relatifs en particulier au plan de décarbonation 2030 illustré par les leviers ci-dessous, qui ont vocation à être enrichis dans une version plus aboutie de l’outil numérique de visualisation qui sera publiée en milieu d’année 2024.",
        databtn: true,
        bgcolor: "#F5F5FE",
        image: ChartBarImg
      },
      cardObjectif: {
        title: "Objectif",
        description : "Ces indicateurs n’ont ainsi pas vocation à représenter une vision exhaustive de la planification écologique, mais à illustrer chacun des leviers d’action sur lesquels repose le plan. Ils seront complétés, dans le courant de l’année, par des indicateurs plus complets, y compris pour couvrir les autres enjeux de la planification écologique (adaptation, territorialisation, etc.)",
        databtn: false,
        image: GoalImg
      },
      cardTrajectoire: {
        title: "Trajectoire",
        description : "Les trajectoires affichées pour l’avenir reposent parfois sur des objectifs officiels, parfois sur des hypothèses techniques de travail dans le cadre des travaux actuels de la SNBC ; elles pourront donc évoluer le cas échéant. Enfin, un grand nombre de ces indicateurs ne concerne que l’Hexagone ; faute notamment de données.",
        databtn: false,
        bgcolor: "#F5F5FE",
        image: TrajectoireImg
      },
      cardEvolution: {
        title: "Évolution",
        description : `Un travail spécifique sera mené dans le cours de l’année pour bâtir les indicateurs adéquats correspondant aux spécificités ultra-marines ou se mettre en position de les construire à l’avenir.

Dans ce contexte, il sera important de distinguer chacun des territoires ultramarins et de les placer dans leur contexte singulier, par rapport aux autres territoires d’outre-mer, mais aussi en comparaison avec l’Hexagone et dans le contexte de leur bassin géographique.`,
        databtn: false,
        image: GoalImg
      }
    }
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


</style>
