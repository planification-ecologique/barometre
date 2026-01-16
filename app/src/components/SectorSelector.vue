<template>
  <div class="sector-selector-container">
    <div class="fr-select-group">
      <label class="fr-label" for="sector-select">
        Secteur
      </label>
      <select
        id="sector-select"
        class="fr-select"
        :value="currentSector"
        @change="handleSectorChange"
        aria-label="Sélectionner un secteur"
      >
        <option
          v-for="sector in sectors"
          :key="sector"
          :value="sector"
        >
          {{ sector }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
import router from '../router'
import planifecoMapping from '@/utils/planifeco_mapping.js'

export default {
  name: 'SectorSelector',
  props: {
    currentSector: {
      type: String,
      default: 'Général'
    }
  },
  data() {
    return {
      sectors: []
    }
  },
  mounted() {
    this.loadSectors()
  },
  methods: {
    loadSectors() {
      try {
        const mapping = planifecoMapping.planifecoMapping || planifecoMapping
        this.sectors = mapping.sectors || ['Général']
      } catch (error) {
        console.error('Error loading sectors:', error)
        this.sectors = ['Général']
      }
    },
    handleSectorChange(event) {
      const selectedSector = event.target.value
      if (selectedSector !== this.currentSector) {
        const routeName = window.location.pathname.includes('/staging') ? 'staging-dashboard' : 'dashboard'
        
        // Preserve current view and other query params when changing sector
        const currentQuery = this.$route.query || {}
        const newQuery = {
          sector: selectedSector
        }
        
        // Always set a default view based on the selected sector
        // This ensures we don't end up without a view
        if (selectedSector === 'Général') {
          // For Général, preserve general-engagements or general-chantiers if valid
          if (currentQuery.view === 'general-engagements' || currentQuery.view === 'general-chantiers') {
            newQuery.view = currentQuery.view
          } else {
            // Default to general-engagements
            newQuery.view = 'general-engagements'
          }
        } else {
          // For other sectors, preserve sectorial-engagements or chantier if valid
          if (currentQuery.view === 'sectorial-engagements') {
            newQuery.view = 'sectorial-engagements'
          } else if (currentQuery.view === 'chantier' && currentQuery.chantier_id) {
            // Preserve chantier view - SideNavigation will check if chantier exists in new sector
            newQuery.view = 'chantier'
            newQuery.chantier_id = currentQuery.chantier_id
          } else {
            // Default to sectorial-engagements
            newQuery.view = 'sectorial-engagements'
          }
        }
        
        router.push({
          name: routeName,
          query: newQuery
        }).catch(err => {
          if (err.name !== 'NavigationDuplicated') {
            console.error('Navigation error:', err)
          }
        })
      }
    }
  },
  watch: {
    '$route.query.sector'(newSector) {
      // Update select value when route changes
      if (newSector && this.$el) {
        this.$nextTick(() => {
          const select = this.$el.querySelector('#sector-select')
          if (select && select.value !== newSector) {
            select.value = newSector
          }
        })
      }
    },
    currentSector(newSector) {
      // Update select value when prop changes
      if (newSector && this.$el) {
        this.$nextTick(() => {
          const select = this.$el.querySelector('#sector-select')
          if (select && select.value !== newSector) {
            select.value = newSector
          }
        })
      }
    }
  }
}
</script>

<style scoped>
.sector-selector-container {
  padding: 1rem;
  background-color: var(--background-default-grey, #f6f6f6);
  border-bottom: 1px solid var(--border-default-grey, #e5e5e5);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.fr-select-group {
  max-width: 100%;
}

.fr-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
  color: var(--text-title-grey, #161616);
}

.fr-select {
  width: 100%;
  max-width: 400px;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .sector-selector-container {
    padding: 0.75rem 1rem;
  }
  
  .fr-label {
    font-size: 0.875rem;
    margin-bottom: 0.375rem;
  }
  
  .fr-select {
    font-size: 1rem;
    padding: 0.75rem;
    max-width: 100%;
  }
}

/* Desktop: make it more compact */
@media (min-width: 769px) {
  .sector-selector-container {
    padding: 0.75rem 1.5rem;
  }
  
  .fr-select-group {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .fr-label {
    margin-bottom: 0;
    white-space: nowrap;
  }
  
  .fr-select {
    flex: 0 0 auto;
    min-width: 250px;
  }
}
</style>
