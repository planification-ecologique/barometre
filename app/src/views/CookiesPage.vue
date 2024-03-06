<template>
  <div class="fr-container fr-container--fluid">
    <!-- Utilisation du composant modal -->
    <!-- <ConsentBanner /> -->
  </div>
</template>

<script>
import ConsentBanner from '../components/ConsentBanner.vue';

export default {
  name: 'CookiesPage',
  components: {
    ConsentBanner
  },
  data() {
    return {
      // isModalOpen: true
    };
  },
  methods: {
    // handleCloseModal() {
    //   this.isModalOpen = false;
    // }
  }
}
</script>
