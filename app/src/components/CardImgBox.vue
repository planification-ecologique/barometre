<template>
  <div
    class="fr-card fr-card--lg fr-enlarge-link fr-card--horizontal card--hpadding"
    :style="{ backgroundColor: cardObject.bgcolor }"
  >
    <div class="fr-card__body card-margin">
      <div class="fr-card__content card--content">
        <h2 class="view-data">{{ cardObject.title }}</h2>

        <div class="fr-card__start">
          <p class="fr-text--lg fr-text--black">
            {{ cardObject.description }}
          </p>
          <button
            id="fr-button-link-dashboard"
            class="fr-btn fr-enlarge-link"
            v-if="cardObject.databtn"
            v-on:keyup.enter="onEnter()"
            title="Consulter toutes les données"
          >
            <a :href="dashboard_link">Consulter toutes les données</a>
          </button>
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
</style>
