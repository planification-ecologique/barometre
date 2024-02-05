<template>
  <div class="fr-container fr-container-page">
    <!-- <h1>Dashboard Page</h1>    -->
    <div class="fr-grid-row">
      <div class="fr-col-12">
        <h1 class="fr-title">Transport</h1>
        <h4 class="fr-subtitle">Emissions</h4>
        <!-- <tags-dsfr v-on:tags=set_tags class="fr-tags"></tags-dsfr> -->
      </div>
    </div>
    <div class="fr-grid-row fr-grid-row--gutters fr-py-md-3w">
      <div class="fr-col-12 fr-col-sm-6 fr-col-md-6 fr-col-xl-6">
        <graph-box :dataObj=BoxDataA :color=colors> </graph-box>
      </div>
      <div class="fr-col-12 fr-col-sm-6 fr-col-md-6 fr-col-xl-6">
        <graph-box :dataObj=BoxDataB :color=colors> </graph-box>
      </div>
       <div class="fr-col-12 fr-col-sm-6 fr-col-md-6 fr-col-xl-6">
        <graph-box :dataObj=BoxDataC :color=colors> </graph-box>
      </div>
       <div class="fr-col-12 fr-col-sm-6 fr-col-md-6 fr-col-xl-6">
        <graph-box :dataObj=BoxDataD :color=colors> </graph-box>
      </div>
       <div class="fr-col-12 fr-col-sm-6 fr-col-md-6 fr-col-xl-6">
        <graph-box :dataObj=BoxDataE :color=colors> </graph-box>
      </div>
        <div class="fr-col-12 fr-col-sm-6 fr-col-md-6 fr-col-xl-6">
        <graph-box :dataObj=BoxDataF :color=colors> </graph-box>
      </div>
    </div>

    <!-- Up Footer -->
    <div class="fr-grid-row">
      <div class="fr-col-12">
        <h2 class="fr-footer__body fr-btns-group--between">
          Les axes pour transformer la société
          <a
            class="fr-link fr-icon-arrow-right-line fr-link--icon-right"
            href="#"
            >Suivre les réformes</a
          >
        </h2>
        <up-footer></up-footer>
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
import GraphBox from "../components/GraphBox.vue";

export default {
  name: "Secret",
  components: {
    CardImgBox,
    UpFooter,
    ChartBarImg,
    GoalImg,
    TrajectoireImg,
    GraphBox,
  },
  data() {
    return {
      querySuccess: true,
      sujets: "sujets",
      colors: [
        "beige-gris-galet",
        "brown-caramel",
        "green-bourgeon",
        "green-menthe",
      ],
      BoxDataA: {
        title: "Emissions CO2 du secteur des transports (hors aérien)",
        update_date: "12/01/2024",
        description: "Lorem Ipsum",
        source: "Talkwalker du 24/01/2023",
        trendValue: -1,
        unit: "Millions de tonnes en équivalent CO2",
        serie_values: {
          // x: [["2017", "2018", "2019"], ["2017", "2018", "2019"], ["2017", "2018", "2019"]],
          x: [
            [
              "2017",
              "2018",
              "2019",
              "2020",
              "2021",
              "2022",
              "2023",
              "2024",
              "2025",
              "2026",
              "2027",
              "2028",
              "2029",
              "2030",
            ],
            [
              "2017",
              "2018",
              "2019",
              "2020",
              "2021",
              "2022",
              "2023",
              "2024",
              "2025",
              "2026",
              "2027",
              "2028",
              "2029",
              "2030",
            ],
            [
              "2017",
              "2018",
              "2019",
              "2020",
              "2021",
              "2022",
              "2023",
              "2024",
              "2025",
              "2026",
              "2027",
              "2028",
              "2029",
              "2030",
            ],
            [
              "2017",
              "2018",
              "2019",
              "2020",
              "2021",
              "2022",
              "2023",
              "2024",
              "2025",
              "2026",
              "2027",
              "2028",
              "2029",
              "2030",
            ],
          ],
          y: [
            [20, 18, 15, 13, 12, 16, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 15, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 14, 11, 8, 7, 6, 5, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
          ],
          name: ["Historique", "Année en cours", "Projection", "Cible"],
        },
        horizontal: false,
        stacked: true,
      },
      BoxDataB: {
        title: "Emissions CO2 du secteur des transports (hors international)",
       update_date: "12/01/2024",
        description: "Lorem Ipsum",
        source: "Talkwalker du 24/01/2023",
        trendValue: -1,
        unit: "Millions de tonnes en équivalent CO2",
        serie_values: {
          // x: [["2017", "2018", "2019"], ["2017", "2018", "2019"], ["2017", "2018", "2019"]],
          x: [
            [
              "2017",
              "2018",
              "2019",
              "2020",
              "2021",
              "2022",
              "2023",
              "2024",
              "2025",
              "2026",
              "2027",
              "2028",
              "2029",
              "2030",
            ],
            [
              "2017",
              "2018",
              "2019",
              "2020",
              "2021",
              "2022",
              "2023",
              "2024",
              "2025",
              "2026",
              "2027",
              "2028",
              "2029",
              "2030",
            ],
            [
              "2017",
              "2018",
              "2019",
              "2020",
              "2021",
              "2022",
              "2023",
              "2024",
              "2025",
              "2026",
              "2027",
              "2028",
              "2029",
              "2030",
            ],
            [
              "2017",
              "2018",
              "2019",
              "2020",
              "2021",
              "2022",
              "2023",
              "2024",
              "2025",
              "2026",
              "2027",
              "2028",
              "2029",
              "2030",
            ],
          ],
          y: [
            [20, 18, 15, 13, 12, 16, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 15, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 14, 11, 8, 7, 6, 5, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
          ],
          name: ["Historique", "Année en cours", "Projection", "Cible"],
        },
        horizontal: false,
        stacked: true,
      },
      BoxDataC: {
        title: "Emissions HFC du secteur des transports (hors international)",
       update_date: "12/01/2024",
        description: "Lorem Ipsum",
        source: "Talkwalker du 24/01/2023",
        trendValue: -1,
        unit: "Millions de tonnes en équivalent CO2",
        serie_values: {
          // x: [["2017", "2018", "2019"], ["2017", "2018", "2019"], ["2017", "2018", "2019"]],
          x: [
            [
              "2017",
              "2018",
              "2019",
              "2020",
              "2021",
              "2022",
              "2023",
              "2024",
              "2025",
              "2026",
              "2027",
              "2028",
              "2029",
              "2030",
            ],
            [
              "2017",
              "2018",
              "2019",
              "2020",
              "2021",
              "2022",
              "2023",
              "2024",
              "2025",
              "2026",
              "2027",
              "2028",
              "2029",
              "2030",
            ],
            [
              "2017",
              "2018",
              "2019",
              "2020",
              "2021",
              "2022",
              "2023",
              "2024",
              "2025",
              "2026",
              "2027",
              "2028",
              "2029",
              "2030",
            ],
            [
              "2017",
              "2018",
              "2019",
              "2020",
              "2021",
              "2022",
              "2023",
              "2024",
              "2025",
              "2026",
              "2027",
              "2028",
              "2029",
              "2030",
            ],
          ],
          y: [
            [20, 18, 15, 13, 12, 16, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 15, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 14, 11, 8, 7, 6, 5, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
          ],
          name: ["Historique", "Année en cours", "Projection", "Cible"],
        },
        horizontal: false,
        stacked: true,
      },
      BoxDataD: {
        title: "Emissions annuelles du transport aérien domestique",
        update_date: "12/01/2024",
        description: "Lorem Ipsum",
        source: "Talkwalker du 24/01/2023",
        trendValue: -1,
        unit: "Millions de tonnes en équivalent CO2",
        serie_values: {
          // x: [["2017", "2018", "2019"], ["2017", "2018", "2019"], ["2017", "2018", "2019"]],
          x: [
            [
              "2017",
              "2018",
              "2019",
              "2020",
              "2021",
              "2022",
              "2023",
              "2024",
              "2025",
              "2026",
              "2027",
              "2028",
              "2029",
              "2030",
            ],
            [
              "2017",
              "2018",
              "2019",
              "2020",
              "2021",
              "2022",
              "2023",
              "2024",
              "2025",
              "2026",
              "2027",
              "2028",
              "2029",
              "2030",
            ],
            [
              "2017",
              "2018",
              "2019",
              "2020",
              "2021",
              "2022",
              "2023",
              "2024",
              "2025",
              "2026",
              "2027",
              "2028",
              "2029",
              "2030",
            ],
            [
              "2017",
              "2018",
              "2019",
              "2020",
              "2021",
              "2022",
              "2023",
              "2024",
              "2025",
              "2026",
              "2027",
              "2028",
              "2029",
              "2030",
            ],
          ],
          y: [
            [20, 18, 15, 13, 12, 16, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 15, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 14, 11, 8, 7, 6, 5, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
          ],
          name: ["Historique", "Année en cours", "Projection", "Cible"],
        },
        horizontal: false,
        stacked: true,
      },
        BoxDataE: {
        title: "Soutes internationales aériennes",
         update_date: "12/01/2024",
        description: "Lorem Ipsum",
        source: "Talkwalker du 24/01/2023",
        trendValue: -1,
        unit: "Millions de tonnes en équivalent CO2",
        serie_values: {
          // x: [["2017", "2018", "2019"], ["2017", "2018", "2019"], ["2017", "2018", "2019"]],
          x: [
            [
              "2017",
              "2018",
              "2019",
              "2020",
              "2021",
              "2022",
              "2023",
              "2024",
              "2025",
              "2026",
              "2027",
              "2028",
              "2029",
              "2030",
            ],
            [
              "2017",
              "2018",
              "2019",
              "2020",
              "2021",
              "2022",
              "2023",
              "2024",
              "2025",
              "2026",
              "2027",
              "2028",
              "2029",
              "2030",
            ],
            [
              "2017",
              "2018",
              "2019",
              "2020",
              "2021",
              "2022",
              "2023",
              "2024",
              "2025",
              "2026",
              "2027",
              "2028",
              "2029",
              "2030",
            ],
            [
              "2017",
              "2018",
              "2019",
              "2020",
              "2021",
              "2022",
              "2023",
              "2024",
              "2025",
              "2026",
              "2027",
              "2028",
              "2029",
              "2030",
            ],
          ],
          y: [
            [20, 18, 15, 13, 12, 16, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 15, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 14, 11, 8, 7, 6, 5, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
          ],
          name: ["Historique", "Année en cours", "Projection", "Cible"],
        },
        horizontal: false,
        stacked: true,
      },
          BoxDataF: {
        title: "Soutes internationales maritimes",
        update_date: "12/01/2024",
        description: "Lorem Ipsum",
        source: "Talkwalker du 24/01/2023",
        trendValue: -1,
        unit: "Millions de tonnes en équivalent CO2",
        serie_values: {
          // x: [["2017", "2018", "2019"], ["2017", "2018", "2019"], ["2017", "2018", "2019"]],
          x: [
            [
              "2017",
              "2018",
              "2019",
              "2020",
              "2021",
              "2022",
              "2023",
              "2024",
              "2025",
              "2026",
              "2027",
              "2028",
              "2029",
              "2030",
            ],
            [
              "2017",
              "2018",
              "2019",
              "2020",
              "2021",
              "2022",
              "2023",
              "2024",
              "2025",
              "2026",
              "2027",
              "2028",
              "2029",
              "2030",
            ],
            [
              "2017",
              "2018",
              "2019",
              "2020",
              "2021",
              "2022",
              "2023",
              "2024",
              "2025",
              "2026",
              "2027",
              "2028",
              "2029",
              "2030",
            ],
            [
              "2017",
              "2018",
              "2019",
              "2020",
              "2021",
              "2022",
              "2023",
              "2024",
              "2025",
              "2026",
              "2027",
              "2028",
              "2029",
              "2030",
            ],
          ],
          y: [
            [20, 18, 15, 13, 12, 16, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 15, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 14, 11, 8, 7, 6, 5, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
          ],
          name: ["Historique", "Année en cours", "Projection", "Cible"],
        },
        horizontal: false,
        stacked: true,
      },
    };
  },
  computed: {},
   methods: {
    router_to_pages (pagename) {
        this.myrouter.push({ name: pagename })
    },

    // Range function for BoxDataA


  },
  mounted() {
    this.setDimension()
    this.graphics()
  }
};
</script>

<style>
.flex-container {
  max-width: none;
  overflow: hidden;
}

.flex-container {
  padding-top: 1.5rem;

  padding-bottom: 2.5rem;
}
.fr-container-page {
  background-color: #f6f6f6;
  padding-top: 1.5rem;
  padding-left: 2.5rem;
  padding-right: 2.5rem;
}

.fr-title {
  margin-bottom: 0.625rem;
}

.fr-subtitle {
  font-weight: 400;
}
</style>
