<template>  
  <div class="cursor_pointer">
    <nav class="fr-nav" id="header-navigation" role="navigation" aria-label="Menu principal">
      <ul class="fr-nav__list">
        <li class="breadcrumb" v-for="option in menuOptions" :key="option.value">
          <a class="fr-nav__link" target="_self" :href="option.link" :aria-current="option.selected" :id="'navigation'+option.value"  :title="option.label">{{ option.label }}</a>
          <!-- <a class="fr-nav__link" @click="router_to_pages(option)" target="_self"  :aria-current="option.selected" :tabindex="0" style="color: rgb(59, 58, 58);">{{ option.label }}</a> -->
        </li>
      </ul>
    </nav>
  </div>
</template>


<script>
import router from '../router'
export default {
  name: 'NavigationDsfr',
  data() {
    return {
      myrouter: router,
      menuOptions: []
    }
  },
  methods: {
    get_menu_options() {
      let base = process.env.VUE_APP_PREFIX_PATH
      this.menuOptions = [
        { value: 'accueil', label: 'Accueil', selected: false, link: base + "/accueil" },
        { value: 'dashboard', label: 'Tableau de bord', selected: false, link: base + "/dashboard?theme=default&levier=default" },
        { value: 'tags', label: 'Tags', selected: false, link: base + "/tags" }
      ]
      var current_page = this.get_name_page()
      if (current_page == '') {
        current_page = 'accueil'
      }
      var pages = [];      
      for (var index in this.menuOptions) pages.push(this.menuOptions[index].value)
      
      if (pages.includes(current_page)) this.set_selected_page(current_page)
      
    },
    router_to_pages(option) {
      var name_page = this.get_name_page()
      if (option.value != name_page) {
          this.myrouter.push({ name: option.value })
        }
        this.set_selected_page(option.value)
    },
    set_selected_page(page_name) {
      this.menuOptions.forEach(function(element){element.selected = false}) 
      this.menuOptions.filter((element) => element.value === page_name)[0].selected = true
    },
    get_name_page() {
      let location = window.location.href
      var page = location.split('/')

      // si dashbord est dans l'url
      if (page.includes('dashboard')) {
        page = 'dashboard'
      } else {
        page = page[page.length - 1]
        page = page.split('?')[0]
        page = page.split('#')[0]
      }

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
