<template>
  <div class="cursor_pointer">
    <nav class="fr-nav" id="header-navigation" role="navigation" aria-label="Menu principal">
      <ul class="fr-nav__list">
        <li class="breadcrumb" v-for="option in menuOptions" :key="option.value">
          <a class="fr-nav__link" target="_self" :href="option.link" :aria-current="option.selected"
            :id="'navigation' + option.value" :title="option.label">{{ option.label }}</a>
          <!-- <a class="fr-nav__link" @click="router_to_pages(option)" target="_self"  :aria-current="option.selected" :tabindex="0" style="color: rgb(59, 58, 58);">{{ option.label }}</a> -->
        </li>
      </ul>
    </nav>
  </div>
</template>


<script>
import router from '../router'
import planifecoMapping from '@/utils/planifeco_mapping.js'

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
      const isStaging = window.location.pathname.includes('/staging')
      const stagingPrefix = isStaging ? '/staging' : ''
      
      // Get sectors from mapping
      const mapping = planifecoMapping.planifecoMapping || planifecoMapping
      const sectors = mapping.sectors || ['Transports']
      
      // Build menu options with sectors
      this.menuOptions = []
      
      // Add sector tabs
      sectors.forEach(sector => {
        const sectorValue = sector.toLowerCase().replace(/\s+/g, '-').replace(/[àâä]/g, 'a').replace(/[éèêë]/g, 'e').replace(/[îï]/g, 'i').replace(/[ôö]/g, 'o').replace(/[ùûü]/g, 'u')
        this.menuOptions.push({
          value: `sector-${sectorValue}`,
          label: sector,
          selected: false,
          link: base + stagingPrefix + `/dashboard?sector=${encodeURIComponent(sector)}`
        })
      })
      
      // Add other menu items
      this.menuOptions.push(
        { value: 'search', label: 'Recherche', selected: false, link: base + stagingPrefix + "/search" },
        { value: 'a-propos', label: 'À propos', selected: false, link: base + "/a-propos" }
      )
      
      var current_page = this.get_name_page()
      if (current_page == '') {
        current_page = 'dashboard'
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
      this.menuOptions.forEach(function (element) { element.selected = false })
      this.menuOptions.filter((element) => element.value === page_name)[0].selected = true
    },
    get_name_page() {
      let location = window.location.href
      var page = location.split('/')

      // Check if dashboard is in URL and get sector from query
      if (page.includes('dashboard')) {
        const urlParams = new URLSearchParams(window.location.search)
        const sector = urlParams.get('sector')
        if (sector) {
          const sectorValue = sector.toLowerCase().replace(/\s+/g, '-').replace(/[àâä]/g, 'a').replace(/[éèêë]/g, 'e').replace(/[îï]/g, 'i').replace(/[ôö]/g, 'o').replace(/[ùûü]/g, 'u')
          return `sector-${sectorValue}`
        }
        return 'dashboard'
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

.breadcrumb {
  margin-left: 17px;
}
</style>
