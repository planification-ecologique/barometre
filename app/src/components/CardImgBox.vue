<template>
  <div class="fr-card fr-card--lg fr-card--horizontal card--hpadding" :style="{ backgroundColor: cardObject.bgcolor }">
    <div class="fr-card__body card-margin">
      <div class="fr-card__content ">
        <h1 class="view-data">{{ cardObject.title }}</h1>

        <div class="fr-card__start">
          <p class="fr-text--lg fr-text--black">
            {{ cardObject.description }}
          </p>
          <a id="fr-button-link-dashboard" class="fr-btn fr-btn-text" v-if="cardObject.databtn" :href="dashboard_link"
            title="Consulter toutes les données">Consulter toutes les données</a>
          <a id="fr-button-link-dashboard" class="fr-btn fr-btn-text" v-if="cardObject.datasource" :href="datasource_link" target="_blank"
            title="Consulter toutes les données">Consulter les données sources</a>
        </div>
      </div>
    </div>
    <div class="fr-card__header right-image" :is="cardObject.image"></div>
  </div>
</template>

<script>
import ChartBarImg from "./components_sgv/ChartBarImg";
import FranceImg from "./components_sgv/FranceImg.vue";
import router from "../router";
let base = process.env.VUE_APP_PREFIX_PATH;
export default {
  name: "CardImgBox",
  components: {
    ChartBarImg,
    FranceImg,
  },
  data() {
    return {
      dashboard_link: base + "/dashboard?theme=default&levier=default",
      datasource_link: "https://www.data.gouv.fr/fr/datasets/indicateurs-regionaux-de-planification-ecologique/",
      myrouter: router,
    };
  },
  props: {
    cardObject: {
      type: Object,
      required: true,
    },
  },
  methods: {
    onEnter() {
      this.myrouter.push({ name: "dashboard", query: { theme: "default", levier: "default" } });
    }
  }
};
</script>

<style scoped>
@media (max-width: 768px) {
  .fr-btn {
    width: 100%;
    padding: 10px 20px;
    font-size: 1rem; 
  }
}
.fr-card:hover {
  box-shadow: none !important;
  transform: none !important;
}

.fr-link {
  margin-top: 10px;
  color: #040091;
  text-decoration: underline;
}

.right-image {
  order: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-margin {
  padding-right: 3rem;
}

.card--hpadding {
  padding: 0 5rem !important;
  padding-top: 0.5rem !important;
  background-color: #ffffff;
  white-space: pre-line;
}

.card--content {
  padding-top: 4rem !important;
}

.fr-text--black {
  color: #000000;
}

.view-data {
  display: flex;
  justify-content: space-between;
}
.fr-btn-text{
  text-align: center;
}
</style>
