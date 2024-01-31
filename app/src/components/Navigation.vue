<template>
  <!-- Liens directs uniquement -->
  <div class="cursor_pointer">
    <nav class="fr-nav" id="header-navigation" role="navigation" aria-label="Menu principal">
      <ul class="fr-nav__list fr-ml-1w">
        <li class="fr-nav__item" @click="router_to_accueil()">
          <a class="fr-nav__link" style="color: rgb(59, 58, 58);" target="_self" :aria-current="currentAccueil">{{ accueil.label }} </a>
        </li>
        <li class="fr-nav__item"  data-fr-js-navigation-item="true" @click="router_to_dashboard()">
          <button class="fr-nav__btn" aria-expanded="false" aria-controls="menu-776"  :aria-current="tablebord_selected">Tableaux de bord</button>
          <div class="fr-collapse fr-menu" id="menu-776">
            <ul class="fr-menu__list">
              <li v-for="option in menuOptions" :key="option.value">
                <a class="fr-nav__link" @click="router_to_pages(option)" style="color: rgb(59, 58, 58);">{{ option.label }}</a>
              </li>
            </ul>
          </div>
        </li>
        <li class="fr-nav__item" @click="router_to_tags()">
          <a class="fr-nav__link" style="color: rgb(59, 58, 58);" target="_self" :aria-current="currentTags">{{ tags.label }}</a>
        </li>
        <li class="fr-nav__item" @click="router_to_lexique()">
          <a class="fr-nav__link" style="color: rgb(59, 58, 58);" target="_self" :aria-current="currentLexique">{{ lexique.label }} </a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import router from '../router'
export default {
  name: 'navigation-dsfr',
  data() {
    return {
      currentDashboard: false,
      currentTags: false,
      currentLexique: false,
      currentVisits: false,
      currentAccueil:false,
      myrouter: router,
      menuOptions: [],
      accueil: Object,
      lexique: Object,
      tags: Object,
      tablebord_selected: false,
    }
  },
  methods: {
    get_menu_options() {
      this.menuOptions = [
        { value: 'vue', label: "Vue d'ensemble", selected: false },
        { value: 'transport', label: 'Transport', selected: false },
        { value: 'energie', label: 'Energie', selected: false },
        { value: 'batiments', label: "Bâtiments", selected: false },
        { value: 'industries', label: 'Industries', selected: false },
        { value: 'economie-circuelaire', label: 'Economie circulaire', selected: false },
        { value: 'eau', label: 'Eau', selected: false },
        { value: 'agriculture-alimentation', label: 'Agriculture et Alimentation', selected: false },
        { value: 'ecosystemes', label: 'Ecosystèmes', selected: false }
      ]
      this.accueil = { value: 'accueil', label: 'Accueil', selected: false }
      this.tags = { value: 'tags', label: 'Tags', selected: false }
      this.lexique = { value: 'lexique', label: 'Lexique', selected: false }
    },
    router_to_pages(option) {
      var name_page = this.get_name_page()
      if (option.value != name_page) {
        this.myrouter.push({ name: option.value })
        this.set_selected_page(option.value)
      }
    },
    set_selected_page(page_name) {
      this.accueil.selected = false
      this.lexique.selected = false
      this.tablebord_selected = false
      this.tags.selected = false

      if (['accueil', 'lexique', 'tags'].includes(page_name)) {
        if (page_name == 'accueil') this.accueil.selected = true
        else if (page_name == 'lexique') this.lexique.selected = true
        else if (page_name == 'tags') this.tags.selected = true
      } else this.tablebord_selected = true
    },
    get_name_page() {
      let location = window.location.href
      var page = location.split('/')
      page = page[page.length - 1]
      page = page.split('#')[0]
      return page
    },
    router_to_accueil() {
      this.myrouter.push({ name: 'accueil' })
      this.currentAccueil = false
      this.currentVisits = true
      if (this.get_name_page() == "accueil") {
        window.location.reload();
      }
    },
    router_to_dashboard() {
      this.myrouter.push({ name: 'dashboard' })
      this.currentDashboard = true
      this.currentVisits = false
    },
    router_to_tags() {
      this.myrouter.push({ name: 'tags' })
      this.currentTags = true
      this.currentVisits = false
    },
    router_to_lexique() {
      this.myrouter.push({ name: 'lexique' })
      this.currentLexique = false
      this.currentVisits = true
      // if (this.get_name_page() == "visites") {
      //   window.location.reload();
      // }
    },
  },
  mounted() {
    this.get_menu_options()
      var current_page = this.get_name_page()
      this.set_selected_page(current_page)
  }
}
</script>

<style>
a:hover:not([href]) {
  cursor: pointer;
  /*default;*/
}

.cursor_pointer {
  cursor: pointer;
}

.fr-nav__list {
  padding-left: 20px;
}
</style>
