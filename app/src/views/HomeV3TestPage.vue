<template>
  <div class="fr-container--fluid fr-container-page">
    <about-view-v3 :use-staging="useStaging" />
  </div>
</template>

<script>
import AboutViewV3 from "../components/AboutViewV3.vue";

export default {
  name: "HomeV3TestPage",
  components: {
    AboutViewV3
  },
  props: {
    useStaging: {
      type: Boolean,
      default: false
    }
  }
};
</script>
