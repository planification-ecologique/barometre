<template>
  <div class="fr-container">
    <div id="sidenav" class="sidenavigation">
      <SideNavigation />
    </div>
    <div class="">
      <div class="fr-grid-row">
        <div class="title fr-pl-5w fr-pt-3w fr-mb-3w">
          <h2>Transport</h2>
          <h5>Emissions</h5>
        </div>
        <div class="section fr-pl-4w">
          <div class="graph-box">
            <bar-box
              class="fr-m-1w"
              :serieObj="kpiData"
              :color="colors"
            ></bar-box>
            <bar-box
              class="fr-m-1w"
              :serieObj="kpiData2"
              :color="colors"
            ></bar-box>
          </div>
          <br />
        </div>
        <div class="section fr-pl-4w">
          <div></div>
          <div class="graph-box">
            <bar-box
              class="fr-m-1w"
              :serieObj="kpiData3"
              :color="colors"
            ></bar-box>
            <bar-box
              class="fr-m-1w"
              :serieObj="kpiData4"
              :color="colors"
            ></bar-box>
          </div>
          <br />
        </div>

         <div class="section fr-pl-4w ">
          <div></div>
          <div class="graph-box">
        <bar-box
              class="fr-m-1w"
              :serieObj="kpiData5"
              :color="colors"
            ></bar-box>
            <br>
            <bar-box
              class="fr-m-1w"
              :serieObj="kpiData6"
              :color="colors"
            ></bar-box>
          </div>
          <br />
        </div>

      <br>


        <!-- <UpFooter/> -->
        </div>
        <div class="fr-grid-row">
      <div class="fr-pl-1w">
            <h2 class="fr-footer__body fr-btns-group--between">Les axes pour transformer la société
              <a class="fr-link fr-icon-arrow-right-line fr-link--icon-right" href="#">Suivre les réformes</a>
            </h2>

            <div class="fr-col-12">
              <up-footer></up-footer>
            </div>
        
      </div>
      <br>
    </div>  

      </div>
    </div>
</template>

<script>
import axios from "axios";
import CardImgBox from "../components/CardImgBox.vue";
import UpFooter from "../components/UpFooter.vue";

/* Import des images */
import ChartBarImg from "../components/components_sgv/ChartBarImg.vue";
import GoalImg from "../components/components_sgv/GoalImg.vue";
import TrajectoireImg from "../components/components_sgv/TrajectoireImg.vue";
import SideBar from "../components/SideBar.vue";
import SideNavigation from "../components/SideNavigation.vue";

import DataBox from "../components/DataBox.vue";
import BarBox from "../components/BarBox.vue";

export default {
  name: "Secret",
  components: {
    CardImgBox,
    UpFooter,
    ChartBarImg,
    GoalImg,
    TrajectoireImg,
    SideBar,
    DataBox,
    BarBox,
    SideNavigation,
  },
  data() {
    return {
      querySuccess: true,
      isquery: true,

      cardIntro: {
        title: "Introduction",
        description:
          "Le prototype béta du tableau de bord ci-dessous présente des indicateurs de la planification écologique pour 9 volets différents (Transverse, Transports, Bâtiments, Energie, Industrie, Agriculture-alimentation, Eau, Ecosystèmes, Economie circulaire), relatifs en particulier au plan de décarbonation 2030 illustré par les leviers ci-dessous, qui ont vocation à être enrichis dans une version plus aboutie de l’outil numérique de visualisation qui sera publiée en milieu d’année 2024.",
        databtn: true,
        bgcolor: "#F5F5FE",
        image: ChartBarImg,
      },
      barData: {
        title: "Volumétrie",
        serie_values: {
          // x: [["2017", "2018", "2019"], ["2017", "2018", "2019"], ["2017", "2018", "2019"]],
          x: [
            [4, 2, 5],
            [4, 2, 5],
            [4, 2, 5],
          ],
          y: [
            [20, 20, 6],
            [4, 4, 4],
            [6, 6, 6],
          ],
          name: ["Colonne A", "Colonne B", "colonne C"],
        },
        horizontal: false,
        update_date: "02/02/2024",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec purus feugiat, molestie ipsum et, consequat nibh.",
        source: "source",
        trendValue: 70,
      },
      barData: {
        title: "Volumétrie",
        serie_values: {
          // x: [["2017", "2018", "2019"], ["2017", "2018", "2019"], ["2017", "2018", "2019"]],
          x: [
            ["4", "2", "3"],
            ["4", "2", "3"],
            ["4", "2", "3"],
          ],
          y: [
            [40, 50, 10],
            [10, 20, 30],
            [12, 12, 20],
          ],
          name: ["Colonne A", "Colonne B", "colonne C"],
        },
        horizontal: true,
        update_date: "02/02/2024",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec purus feugiat, molestie ipsum et, consequat nibh.",
        source: "source",
        trendValue: 70,
      },
      cardObjectif: {
        title: "Objectif",
        description:
          "Ces indicateurs n’ont ainsi pas vocation à représenter une vision exhaustive de la planification écologique, mais à illustrer chacun des leviers d’action sur lesquels repose le plan. Ils seront complétés, dans le courant de l’année, par des indicateurs plus complets, y compris pour couvrir les autres enjeux de la planification écologique (adaptation, territorialisation, etc.)",
        databtn: false,
        image: GoalImg,
      },
      tabData1: {
        title: "Top contributeurs médias et journalistes",
        update_date: "02/02/2024",
        description: "Description",
        source: "source",
        trendValue: -1,
      },
      kpiData: {
        title: "Emissions CO2 du secteur des transports (hors aérien)",
        serie_values: {
          x: ["0", "1", "2", "3", "4"],
          y: [10, 12, 15, 17, 20],
          name: "S4",
        },
        update_date: "02/02/2024",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec purus feugiat, molestie ipsum et, consequat nibh.",
        source: "source",
        trendValue: 75,
      },

      kpiData2: {
        title: "Emissions CO2 du secteur des transports (hors international)",
        serie_values: {
          x: ["0", "1", "2", "3", "4"],
          y: [10, 12, 15, 17, 20],
          name: "S4",
        },
        update_date: "02/02/2024",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec purus feugiat, molestie ipsum et, consequat nibh.",
        source: "source",
        trendValue: 75,
      },
      kpiData3: {
        title: "Emissions HFC du secteur des transports (hors international)",
        serie_values: {
          x: ["0", "1", "2", "3", "4"],
          y: [10, 12, 15, 17, 20],
          name: "S4",
        },
        update_date: "02/02/2024",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec purus feugiat, molestie ipsum et, consequat nibh.",
        source: "source",
        trendValue: 75,
      },
      kpiData4: {
        title: "Emissions annuelles du transport aérien domestique",
        serie_values: {
          x: ["0", "1", "2", "3", "4"],
          y: [10, 12, 15, 17, 20],
          name: "S4",
        },
        update_date: "02/02/2024",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec purus feugiat, molestie ipsum et, consequat nibh.",
        source: "source",
        trendValue: 75,
      },
      kpiData5: {
        title: "Soutes internationales aériennes",
        serie_values: {
          x: ["0", "1", "2", "3", "4"],
          y: [10, 12, 15, 17, 20],
          name: "S4",
        },
        update_date: "02/02/2024",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec purus feugiat, molestie ipsum et, consequat nibh.",
        source: "source",
        trendValue: 75,
      },
      kpiData6: {
        title: "Soutes internationales maritimes",
        serie_values: {
          x: ["0", "1", "2", "3", "4"],
          y: [10, 12, 15, 17, 20],
          name: "S4",
        },
        update_date: "02/02/2024",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec purus feugiat, molestie ipsum et, consequat nibh.",
        source: "source",
        trendValue: 75,
      },
      barData: {
        title: "Volumétrie",
        serie_values: {
          // x: [["2017", "2018", "2019"], ["2017", "2018", "2019"], ["2017", "2018", "2019"]],
          x: [
            [4, 2, 5],
            [4, 2, 5],
            [4, 2, 5],
          ],
          y: [
            [20, 20, 6],
            [4, 4, 4],
            [6, 6, 6],
          ],
          name: ["Colonne A", "Colonne B", "colonne C"],
        },
        horizontal: false,
        update_date: "02/02/2024",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec purus feugiat, molestie ipsum et, consequat nibh.",
        source: "source",
        trendValue: 70,
      },
      barDataH_stacked: {
        title: "Sous-catégories de supports médias",
        serie_values: {
          // x: [["2017", "2018", "2019"], ["2017", "2018", "2019"], ["2017", "2018", "2019"]],
          x: [
            ["4", "2", "3"],
            ["4", "2", "3"],
            ["4", "2", "3"],
          ],
          y: [
            [40, 50, 10],
            [10, 20, 30],
            [12, 12, 20],
          ],
        },
        horizontal: true,
        update_date: "02/02/2024",
        description: "Description",
        source: "source",
        trendValue: 75,
        stacked: true,
      },
      cardTrajectoire: {
        title: "Trajectoire",
        description:
          "Les trajectoires affichées pour l’avenir reposent parfois sur des objectifs officiels, parfois sur des hypothèses techniques de travail dans le cadre des travaux actuels de la SNBC ; elles pourront donc évoluer le cas échéant. Enfin, un grand nombre de ces indicateurs ne concerne que l’Hexagone ; faute notamment de données.",
        databtn: false,
        bgcolor: "#F5F5FE",
        image: TrajectoireImg,
      },
      cardEvolution: {
        title: "Évolution",
        description: `Un travail spécifique sera mené dans le cours de l’année pour bâtir les indicateurs adéquats correspondant aux spécificités ultra-marines ou se mettre en position de les construire à l’avenir.

Dans ce contexte, il sera important de distinguer chacun des territoires ultramarins et de les placer dans leur contexte singulier, par rapport aux autres territoires d’outre-mer, mais aussi en comparaison avec l’Hexagone et dans le contexte de leur bassin géographique.`,
        databtn: false,
        image: GoalImg,
      },
    };
  },
  computed: {},
  methods: {
    toggleSidebar() {
      this.isquery = !this.isquery;
    },
    closeSidebar() {
      this.$emit("close"); // Émet un événement pour indiquer la fermeture de la sidebar
    },
    refresh(query_sidebar) {
      if (query_sidebar != undefined) {
        this.myobj = query_sidebar;
        this.isquery = true;
      }
    },
  },
  mounted() {
    this.setDimension();
    this.graphics();
  },
};
</script>

<style>
.sidenavigation {
  width: 330px;
}
.fr-col-3 {
  background-color: white;
}

.fr-container {
  display: flex;
}
.header-resultats {
  margin-top: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fr-grid-row {
  background-color: #f6f6f6;
  /* width: 950px; */
  /* height: 1957.59px; */
  padding: 24px, 40px, 24px, 40px;
  gap: 24px;
}
.title {
  width: 935px;
  height: 82px;
  gap: 10px;
}
.upfooter-title {
  display: flex;
  justify-content: space-between;
}
.barbox {
  width: 300px;
  height: 465.63px;
  display: flex;
  justify-content: center;
}
/* .widget-cards {
  width: 1030px;
  height: 1444.88px;
  gap: 48px;
} */
.graph-box {
  display: flex;
  justify-content: space-between;
  /* width: 1030px; */
  /* height: 1444.88px; */
  /* gap: 48px; */
  /* flex-wrap: wrap; */
}
.upfooter {
  padding: 20px;
  padding: auto;
  width: 200px;
}

.header-resultats {
  margin-top: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* .box-resultats {
  background-color: #e3f2eb;
} */

.box-header-resultats {
  margin-top: 1.5rem;
}

.footer-resultats {
  padding-bottom: 1rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.flex-container {
  display: flex;
}
</style>
