<template>
  <nav role="navigation" class="fr-sidemenu fr-sidemenu--sticky fr-sidemenu__padding"  aria-labelledby="fr-sidemenu-title">
    <div class="fr-sidemenu__inner">
      <button class="fr-sidemenu__btn" aria-controls="fr-sidemenu-wrapper" aria-expanded="false">Filtre sur les indicateurs</button>
      <div class="fr-collapse" id="fr-sidemenu-wrapper">
        <ul class="fr-sidemenu__list">
          <li class="fr-sidemenu__item" v-for="(theme, index) in menuOptions" :key="index">
            <button class="fr-sidemenu__btn" aria-expanded="false" :aria-controls="'fr-sidemenu-item-'+theme.id_theme"> {{ theme.label_theme }} </button> 
            <div class="fr-collapse" :id="'fr-sidemenu-item-'+theme.id_theme">
              <ul class="fr-sidemenu__list">
                <li class="fr-sidemenu__item" v-for="(levier, index) in theme.levier" :key="index">
                  <a class="fr-sidemenu__link" @click="set_query(theme.label_theme, theme.id_theme, levier)" target="_self" :id="'fr-sidemenu__link-'+theme.id_theme+levier.id_levier"> {{ levier.label_levier }} </a>
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
  props: {
    initParams: {
      type: Object,
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

        try {
          // find selected theme and levier on menuOptions
        var defaultMenu = this.initParams
        defaultMenu.label_theme = this.menuOptions.find(theme => theme.id_theme === defaultMenu.id_theme).label_theme
        defaultMenu.levier = this.menuOptions.find(theme => theme.id_theme === defaultMenu.id_theme).levier.find(levier => levier.id_levier === defaultMenu.id_levier)

        this.set_query(defaultMenu.label_theme, defaultMenu.id_theme, defaultMenu.levier)

        } catch (error) {
          console.error("Erreur dans le chargement de la navigation : ", error);
        }
        
        
      } catch (error) {
        console.error("Erreur dans le chargement de la navigation : ", error);
      }
    },
    set_query (label_theme, id_theme, levier) {
      // console.log(JSON.stringify(levier))
      const menuSelected = document.getElementById('fr-sidemenu__link-'+id_theme+levier.id_levier)

      if (menuSelected) {
        const menuSelecteds = document.querySelectorAll('.fr-sidemenu__link')
        menuSelecteds.forEach((menu) => {
          menu.ariaCurrent = false
        })
        menuSelected.attributes['aria-current'].value = 'page'
      }

      var params = {
        "label_theme": label_theme,
        "label_levier": levier.label_levier, 
        "query" : {
          "filter_by": [
            { "field": "id_theme",
              "values": [id_theme],
            },
            { "field": "id_levier",
              "values": [levier.id_levier]
            }
          ],
          "time_period": {
            "date_start": "2015-01-01",
            "date_end": "2031-01-01"
          }
        }
      }      
      this.$emit('params', params)
    },
  },
  mounted() {    
    this.fetch_menu_options()
  }
}
</script>

<style scoped>
a:hover:not([href]) {
  cursor: pointer;
  background-color: #f6f6f6;
}
</style>
