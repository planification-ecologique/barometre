<template>
  <div class="fr-container--fluid">
    <div class="fr-p-1w">
      <div class="">
        <h1 class="">Lexique</h1>
      </div>

      <div class="">
        <table-component :dataObj="tabData1"></table-component>
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
import TableComponent from "../components/TableComponent.vue";

export default {
  name: "Secret",
  components: {
    CardImgBox,
    UpFooter,
    ChartBarImg,
    GoalImg,
    TrajectoireImg,
    TableComponent,
  },
  data() {
    return {
      querySuccess: true,
      objectWaffle: Object,
      tabData1: {
        title: "Lexique",
        update_date: "17/01/2024",
        description: "Description",
        // source: "Talkwalker",
        trendValue: -1,
      },
    };
  },
  computed: {},
  methods: {},
  mounted() {
    this.setDimension();
    this.graphics();
  },
};
</script>

<style>
.flex-container {
  max-width: none;
  overflow: hidden;
}

.table {
  align-items: center;
  justify-content: center;
  margin-left: 300px;
}
</style>
