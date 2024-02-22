<template>
  <nav class="fr-sidemenu fr-sidemenu--sticky-full-height fr-sidemenu__padding" role="navigation"
    aria-labelledby="fr-sidemenu-title">
    <div class="fr-sidemenu__inner">
      <button class="fr-sidemenu__btn" aria-controls="fr-sidemenu-wrapper" aria-expanded="false"> Dans cette rubrique
      </button>
      <div class="fr-collapse" id="fr-sidemenu-wrapper">
        <!-- <div class="fr-sidemenu__title" id="fr-sidemenu-title">Introduction</div> -->

        <ul class="fr-sidemenu__list">
          

          <li class="fr-sidemenu__item fr-sidemenu__item--active">
            <a class="fr-sidemenu__link" @click="emitSelection([['vue-d-ensemble','Vue d\'ensemble'], ['subtitle','8 indicateurs pour observer d\'un coup d\'œil les principaux vecteurs de la transition écologique.']])" target="_self">Vue
              d'ensemble</a>
          </li>
          <li class="fr-sidemenu__item" v-for="(theme, index) in menuOptions" :key="index">
            <button class="fr-sidemenu__btn" aria-expanded="false" :aria-controls="'fr-sidemenu-item-'+theme.id_theme"> {{ theme.label_theme }} </button> 
            <div class="fr-collapse" :id="'fr-sidemenu-item-'+theme.id_theme">
              <ul class="fr-sidemenu__list">
                <li class="fr-sidemenu__item" v-for="(levier, index) in theme.levier" :key="index">
                  <a class="fr-sidemenu__link" @click="emitSelection([[theme.id_theme, theme.label_theme], [levier.id_levier, levier.label_levier]])" target="_self"> {{ levier.label_levier }} </a>
                </li>
              </ul>
            </div>
          </li>

        </ul>
      </div>
    </div>
  </nav>
</template>

<script>

import { api } from '@/services/api.js'

export default {
  name: 'SideNavigation',
  data() {
    return {
      menuOptions: []
    }
  },
  methods: {
    async fetch_menu_options() {
      try {
        const response = await api('/requests/get_themes_levier', { method: 'GET'});
        if (!response) {
          throw new Error('Erreur lors de la récupération des thèmes et leviers');
        }

        let result = response.data.results
        this.menuOptions = result
      } catch (error) {
        console.error("Erreur dans le chargement de la navigation : ", error);
      }
    },
    emitSelection(selectedValue) {
      // Émettre un événement personnalisé avec l'information de sélection
      this.$emit('selectionChanged', selectedValue);
    }
  },
  mounted() {    
    this.fetch_menu_options()
  }
}
</script>

<style>
a:hover:not([href]) {
  cursor: pointer;
  background-color: #f6f6f6;
}
</style>
  