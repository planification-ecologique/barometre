<template>
  <div class="cursor_pointer">
    <nav class="fr-nav" id="header-navigation" role="navigation" aria-label="Menu principal">
      <ul class="fr-nav__list">
        <li class="nav-item" v-for="option in menuOptions" :key="option.value">
          <!-- Disabled / coming soon item -->
          <template v-if="option.disabled">
            <span
              class="fr-nav__link nav-link--disabled"
              :title="option.label + ' — bientôt disponible'"
            >
              {{ option.label }}
              <span class="nav-coming-soon">▾</span>
            </span>
          </template>
          <!-- Dropdown menu for future use -->
          <template v-else-if="option.hasDropdown">
            <button
              class="fr-nav__link nav-dropdown-btn"
              :class="{ 'fr-nav__link--active': option.selected }"
              :aria-expanded="dropdownOpen ? 'true' : 'false'"
              @click="toggleDropdown(option)"
            >
              {{ option.label }}
              <span class="nav-dropdown-arrow" aria-hidden="true"></span>
            </button>
            <ul v-if="dropdownOpen" class="nav-dropdown-menu">
              <li v-for="sub in option.children" :key="sub.value">
                <a
                  class="nav-dropdown-item"
                  :class="{ 'nav-dropdown-item--active': sub.selected }"
                  :href="sub.link"
                  @click.prevent="handleNavigation(sub)"
                >
                  {{ sub.label }}
                </a>
              </li>
            </ul>
          </template>
          <!-- Regular nav links -->
          <a
            v-else
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
              v-if="option.icon"
              :class="option.icon"
              aria-hidden="true"
              class="nav-favoris-icon"
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
      sectors: [],
      dropdownOpen: false
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
          this.sectors = response.data.sectorNames.filter(s => s !== 'Synthèse')
        }
      } catch (error) {
        console.error('Error loading sectors:', error)
      }

      // Build top nav matching Figma: Accueil, Etat de l'environnement, Chantiers sectoriels, Analyse par secteur dropdown, Favoris
      this.menuOptions = [
        {
          value: 'accueil',
          label: 'Accueil',
          selected: false,
          link: base + stagingPrefix + '/dashboard?sector=Synthèse&view=about'
        },
        {
          value: 'etat-environnement',
          label: 'Etat de l\'environnement',
          selected: false,
          link: base + stagingPrefix + '/dashboard?sector=Synthèse&view=etat-environnement'
        },
        {
          value: 'chantiers-sectoriels',
          label: 'Chantiers sectoriels',
          selected: false,
          link: base + stagingPrefix + '/dashboard?sector=Synthèse&view=chantiers-sectoriels'
        },
        // {
        //   value: 'analyse-par-secteur',
        //   label: 'Analyse par secteur',
        //   selected: false,
        //   disabled: true
        // },
        {
          value: 'favoris',
          label: 'Favoris',
          selected: false,
          icon: 'fr-icon-bookmark-line',
          link: base + '/favoris'
        }
      ]

      // Set initial active tab
      this.updateActiveFromRoute()
    },
    slugify(str) {
      return String(str).toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[àâä]/g, 'a')
        .replace(/[éèêë]/g, 'e')
        .replace(/[îï]/g, 'i')
        .replace(/[ôö]/g, 'o')
        .replace(/[ùûü]/g, 'u')
    },
    toggleDropdown(option) {
      this.dropdownOpen = !this.dropdownOpen
    },
    closeDropdown() {
      this.dropdownOpen = false
    },
    handleNavigation(option) {
      this.closeDropdown()

      if (option.value.startsWith('sector-')) {
        // Navigate to a specific sector
        const sectorMatch = option.link.match(/sector=([^&]+)/)
        if (sectorMatch) {
          const sector = decodeURIComponent(sectorMatch[1])
          const routeName = window.location.pathname.includes('/staging') ? 'staging-dashboard' : 'dashboard'
          this.myrouter.push({
            name: routeName,
            query: { sector: sector }
          }).catch(err => {
            if (err.name !== 'NavigationDuplicated') console.error('Navigation error:', err)
          })
        }
      } else if (option.value === 'accueil') {
        const routeName = window.location.pathname.includes('/staging') ? 'staging-dashboard' : 'dashboard'
        this.myrouter.push({
          name: routeName,
          query: { sector: 'Synthèse', view: 'about' }
        }).catch(err => {
          if (err.name !== 'NavigationDuplicated') console.error('Navigation error:', err)
        })
      } else if (option.value === 'etat-environnement') {
        const routeName = window.location.pathname.includes('/staging') ? 'staging-dashboard' : 'dashboard'
        this.myrouter.push({
          name: routeName,
          query: { sector: 'Synthèse', view: 'etat-environnement' }
        }).catch(err => {
          if (err.name !== 'NavigationDuplicated') console.error('Navigation error:', err)
        })
      } else if (option.value === 'chantiers-sectoriels') {
        const routeName = window.location.pathname.includes('/staging') ? 'staging-dashboard' : 'dashboard'
        this.myrouter.push({
          name: routeName,
          query: { sector: 'Synthèse', view: 'chantiers-sectoriels' }
        }).catch(err => {
          if (err.name !== 'NavigationDuplicated') console.error('Navigation error:', err)
        })
      } else {
        this.myrouter.push({ name: option.value }).catch(err => {
          if (err.name !== 'NavigationDuplicated') console.error('Navigation error:', err)
        })
      }

      this.updateActiveFromRoute()
    },
    updateActiveFromRoute() {
      if (!this.$route) return

      const path = this.$route.path
      const query = this.$route.query

      // Reset all
      this.menuOptions.forEach(opt => {
        opt.selected = false
        if (opt.children) opt.children.forEach(c => { c.selected = false })
      })

      if (path.includes('dashboard')) {
        const sector = query.sector
        const view = query.view

        if (sector === 'Synthèse') {
          if (view === 'chantiers-sectoriels' || view === 'general-chantiers' || view === 'chantiers-table') {
            this.setSelected('chantiers-sectoriels')
          } else if (view === 'etat-environnement' || view === 'general-engagements' || view === 'engagements-table') {
            this.setSelected('etat-environnement')
          } else {
            this.setSelected('accueil')
          }
        } else if (sector) {
          // When viewing a chantier from any sector, stay on "Chantiers sectoriels"
          if (view === 'chantier') {
            this.setSelected('chantiers-sectoriels')
          } else {
            // Other sector views (sectorial-engagements, etc.)
            this.setSelected('chantiers-sectoriels')
          }
        }
      } else if (path.includes('favoris')) {
        this.setSelected('favoris')
      }
    },
    setSelected(value) {
      const opt = this.menuOptions.find(o => o.value === value)
      if (opt) opt.selected = true
    },
    set_selected_page(page_name) {
      // Legacy compat
      this.updateActiveFromRoute()
    },
    get_name_page() {
      // Legacy compat
      return ''
    }
  },
  mounted() {
    this.get_menu_options()

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-dropdown-btn') && !e.target.closest('.nav-dropdown-menu')) {
        this.closeDropdown()
      }
    })

    // Watch route changes
    if (this.$route) {
      this.$watch(
        () => ({
          sector: this.$route.query.sector,
          view: this.$route.query.view,
          path: this.$route.path
        }),
        () => {
          this.updateActiveFromRoute()
        },
        { immediate: true, deep: true }
      )
    }

    this.myrouter.afterEach(() => {
      this.updateActiveFromRoute()
    })
  }
}
</script>

<style>
a:hover:not([href]) {
  cursor: pointer;
}

.cursor_pointer {
  cursor: pointer;
}

.fr-nav__list {
  padding-left: 20px;
  display: flex;
  align-items: center;
}

.nav-item {
  margin-left: 17px;
  position: relative;
  list-style: none;
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

/* Disabled / coming soon nav item - smaller font for Analyse par secteur */
.nav-link--disabled {
  color: #929292 !important;
  cursor: default;
  pointer-events: none;
  font: inherit;
  font-size: 0.8125rem !important;
}

.nav-coming-soon {
  font-size: 0.625rem;
  margin-left: 0.25rem;
  color: #929292;
}

/* Favoris icon - smaller than default (DSFR icons use pseudo-elements, so use transform) */
.nav-favoris-icon {
  margin-right: 0.1rem;
  display: inline-block;
  vertical-align: middle;
  transform: scale(0.7);
  transform-origin: center center;
}

/* Dropdown button */
.nav-dropdown-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font: inherit;
  padding: inherit;
}

.nav-dropdown-arrow {
  display: inline-block;
  width: 0.75rem;
  height: 0.75rem;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23161616' d='M12 15.586L6.707 10.293 8.121 8.879 12 12.757l3.879-3.878 1.414 1.414z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  transition: transform 0.2s ease;
}

.nav-dropdown-btn[aria-expanded="true"] .nav-dropdown-arrow {
  transform: rotate(180deg);
}

/* Dropdown menu */
.nav-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  min-width: 220px;
  background: #fff;
  border: 1px solid #ddd;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  list-style: none;
  padding: 0.5rem 0;
  margin: 0.25rem 0 0;
}

.nav-dropdown-item {
  display: block;
  padding: 0.5rem 1rem;
  color: #3a3a3a;
  text-decoration: none;
  font-size: 0.875rem;
  white-space: nowrap;
}

.nav-dropdown-item:hover {
  background: #f6f6f6;
  color: var(--text-action-high-blue-france);
}

.nav-dropdown-item--active {
  color: var(--text-action-high-blue-france);
  font-weight: 700;
}
</style>
