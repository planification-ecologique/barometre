<template>
  <div class="fr-container--fluid fr-container-page">
    <about-view-v2 :use-staging="useStaging" />
  </div>
</template>

<script>
import AboutViewV2 from "../components/AboutViewV2.vue";

export default {
  name: "HomeV2TestPage",
  components: {
    AboutViewV2
  },
  props: {
    useStaging: {
      type: Boolean,
      default: false
    }
  }
};
</script>
