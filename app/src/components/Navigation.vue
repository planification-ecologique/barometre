<template>
  <div class="cursor_pointer">
    <nav class="fr-nav" id="header-navigation" role="navigation" aria-label="Menu principal">
      <ul class="fr-nav__list">
        <li class="breadcrumb" v-for="option in menuOptions" :key="option.value">
          <a 
            class="fr-nav__link" 
            :class="{ 'fr-nav__link--active': option.selected }"
            target="_self" 
            :href="option.link" 
            :aria-current="option.selected ? 'page' : undefined"
            :id="'navigation' + option.value" 
            :title="option.label"
            @click.prevent="handleNavigation(option)"
          >
            <span
              v-if="option.value === 'search'"
              class="fr-icon-search-line"
              aria-hidden="true"
              style="margin-right: 0.25rem;"
            ></span>
            <span
              v-if="option.value === 'favoris'"
              class="fr-icon-heart-line"
              aria-hidden="true"
              style="margin-right: 0.25rem;"
            ></span>
            {{ option.label }}
          </a>
        </li>
      </ul>
    </nav>
  </div>
</template>


<script>
import router from '../router'
import { getNavigationStructure } from '@/services/csvDataService.js'

export default {
  name: 'NavigationDsfr',
  data() {
    return {
      myrouter: router,
      menuOptions: [],
      sectors: ['Synthèse'] // Default, will be loaded from Grist data
    }
  },
  methods: {
    async get_menu_options() {
      let base = process.env.VUE_APP_PREFIX_PATH
      const isStaging = window.location.pathname.includes('/staging')
      const stagingPrefix = isStaging ? '/staging' : ''
      
      // Load sectors from Grist data
      try {
        const response = await getNavigationStructure('production')
        if (response.status === 'success' && response.data.sectorNames) {
          this.sectors = response.data.sectorNames
        }
      } catch (error) {
        console.error('Error loading sectors:', error)
        // Keep default sectors
      }
      
      // Build menu options with sectors
      this.menuOptions = []
      
      // Add sector tabs
      this.sectors.forEach(sector => {
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
        { value: 'favoris', label: 'Favoris', selected: false, link: base + "/favoris" }
      )
      
      var current_page = this.get_name_page()
      if (current_page == '') {
        current_page = 'dashboard'
      }
      var pages = [];
      for (var index in this.menuOptions) pages.push(this.menuOptions[index].value)

      if (pages.includes(current_page)) this.set_selected_page(current_page)
    },
    handleNavigation(option) {
      // Navigate using router first
      if (option.value.startsWith('sector-')) {
        // Extract sector from value
        const sectorMatch = option.link.match(/sector=([^&]+)/)
        if (sectorMatch) {
          const sector = decodeURIComponent(sectorMatch[1])
          const routeName = window.location.pathname.includes('/staging') ? 'staging-dashboard' : 'dashboard'
          this.myrouter.push({
            name: routeName,
            query: { sector: sector }
          }).then(() => {
            // Update selection after navigation completes
            this.set_selected_page(option.value)
          }).catch(err => {
            // Ignore navigation errors (e.g., navigating to same route)
            if (err.name !== 'NavigationDuplicated') {
              console.error('Navigation error:', err)
            } else {
              // Even if navigation is duplicated, update selection
              this.set_selected_page(option.value)
            }
          })
        }
      } else {
        // For other pages (search, favoris, a-propos)
        let routeName = option.value
        if (option.value === 'search') {
          routeName = window.location.pathname.includes('/staging') ? 'staging-search' : 'search'
        }
        this.myrouter.push({ name: routeName }).then(() => {
          // Update selection after navigation completes
          this.set_selected_page(option.value)
        }).catch(err => {
          if (err.name !== 'NavigationDuplicated') {
            console.error('Navigation error:', err)
          } else {
            // Even if navigation is duplicated, update selection
            this.set_selected_page(option.value)
          }
        })
      }
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
      const selectedOption = this.menuOptions.find((element) => element.value === page_name)
      if (selectedOption) {
        selectedOption.selected = true
      }
    },
    get_name_page() {
      // Use $route if available (more reliable for Vue Router)
      if (this.$route) {
        const path = this.$route.path
        const query = this.$route.query
        
        // Check if dashboard is in path and get sector from query
        if (path.includes('dashboard')) {
          const sector = query.sector
          if (sector) {
            const sectorValue = String(sector).toLowerCase().replace(/\s+/g, '-').replace(/[àâä]/g, 'a').replace(/[éèêë]/g, 'e').replace(/[îï]/g, 'i').replace(/[ôö]/g, 'o').replace(/[ùûü]/g, 'u')
            return `sector-${sectorValue}`
          }
          return 'dashboard'
        } else {
          // Extract page name from path
          const pathParts = path.split('/').filter(p => p)
          return pathParts[pathParts.length - 1] || ''
        }
      }
      
      // Fallback to window.location
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
    
    // Function to update selected tab
    const updateSelectedTab = () => {
      const current_page = this.get_name_page()
      if (current_page) {
        this.set_selected_page(current_page)
      }
    }
    
    // Watch for route changes to update selected tab
    if (this.$route) {
      // Watch both query and path together for better reactivity
      this.$watch(
        () => ({
          sector: this.$route.query.sector,
          path: this.$route.path
        }),
        () => {
          updateSelectedTab()
        },
        { immediate: true, deep: true }
      )
    }
    
    // Also listen to popstate events (browser back/forward)
    window.addEventListener('popstate', updateSelectedTab)
    
    // Listen to router navigation events - this is the most reliable
    this.myrouter.afterEach((to, from) => {
      updateSelectedTab()
    })
    
    // Store cleanup function
    this._cleanupNavigation = () => {
      window.removeEventListener('popstate', updateSelectedTab)
    }
  },
  beforeDestroy() {
    // Cleanup event listener
    if (this._cleanupNavigation) {
      this._cleanupNavigation()
    }
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

/* Style pour l'onglet sélectionné */
.fr-nav__link--active,
.fr-nav__link[aria-current="page"] {
  color: var(--text-action-high-blue-france) !important;
  font-weight: 700;
  position: relative;
}

.fr-nav__link--active::after,
.fr-nav__link[aria-current="page"]::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--text-action-high-blue-france);
}

.fr-nav__link--active:hover,
.fr-nav__link[aria-current="page"]:hover {
  color: var(--text-action-high-blue-france-hover) !important;
}

.fr-nav__link--active:hover::after,
.fr-nav__link[aria-current="page"]:hover::after {
  background-color: var(--text-action-high-blue-france-hover);
}
</style>
