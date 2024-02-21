<template>  
  <div class="cursor_pointer">
    <nav class="fr-nav" id="header-navigation" role="navigation" aria-label="Menu principal">
          <ul class="fr-nav__list">
        <li class="breadcrumb" v-for="option in menuOptions" :key="option.value">
          <a class="fr-nav__link" @click="router_to_pages(option)" target="_self" :aria-current="option.selected" style="color: rgb(59, 58, 58);">{{ option.label }}</a>
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
      myrouter: router,
      menuOptions: []
    }
  },
  methods: {
    get_menu_options() {
      this.menuOptions = [
        { value: 'accueil', label: 'Accueil', selected: false },
        { value: 'dashboard', label: 'Tableaux de bord', selected: false },
        { value: 'tags', label: 'Tags', selected: false },
        { value: 'lexique', label: 'Lexique', selected: false }
      ]
      var current_page = this.get_name_page()      
      if (current_page == '') {
        current_page = 'accueil'
      }
      this.set_selected_page(current_page)
    },
    router_to_pages(option) {
      var name_page = this.get_name_page()
      if (option.value != name_page) {
        this.myrouter.push({ name: option.value })
        this.set_selected_page(option.value)
      }
    },
    set_selected_page(page_name) {
      this.menuOptions.forEach(function(element){element.selected = false}) 
      this.menuOptions.filter((element) => element.value === page_name)[0].selected = true
    },
    get_name_page() {
      let location = window.location.href
      var page = location.split('/')
      page = page[page.length - 1]
      page = page.split('#')[0]
      return page
    }
  },
  mounted() {
    this.get_menu_options()
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
  /* margin-left: 10px; */
}
.breadcrumb{
  margin-left: 17px;
}
</style>
