<template>
  <div class="search-taxonomy-filters">
    <div v-if="sectors.length > 0" class="fr-tags-group filter-group">
      <button
        v-for="sector in sectors"
        :key="'sector-' + sector.value"
        type="button"
        class="fr-tag filter-tag filter-tag--sector"
        :class="{ 'filter-tag--selected': sector.selected }"
        :aria-pressed="sector.selected"
        :title="sector.label"
        @click="toggleSector(sector)"
      >
        {{ sector.label }}
      </button>
    </div>
    <div v-if="displayedAxes.length > 0" class="fr-tags-group filter-group">
      <button
        v-for="axe in displayedAxes"
        :key="'axe-' + axe.value"
        type="button"
        class="fr-tag filter-tag filter-tag--axe"
        :class="{ 'filter-tag--selected': axe.selected }"
        :aria-pressed="axe.selected"
        :title="axe.label"
        @click="toggleAxe(axe)"
      >
        {{ axe.label }}
      </button>
    </div>
  </div>
</template>

<script>
import { getNavigationStructure, IMPACT_AXE_DISPLAY_ORDER } from '@/services/csvDataService.js';

export default {
  name: 'SearchTaxonomyFilters',
  props: {
    useStaging: {
      type: Boolean,
      default: false
    },
    /** Initial sectors to pre-select (e.g. from URL ?sector=X) */
    initialSectors: {
      type: Array,
      default: () => []
    },
    /** Initial axes to pre-select (e.g. from URL ?axe=X) */
    initialAxes: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      sectors: [],
      axes: []
    };
  },
  computed: {
    displayedAxes() {
      const axesSet = new Set(this.axes.map(a => a.value));
      return IMPACT_AXE_DISPLAY_ORDER.filter(axe =>
        axesSet.has(axe) ||
        (axe === 'Économie circulaire' && axesSet.has('Economie circulaire'))
      ).map(axe => {
        const value = axesSet.has(axe) ? axe : (axe === 'Économie circulaire' ? 'Economie circulaire' : axe);
        const existing = this.axes.find(a => a.value === value);
        return {
          value: existing?.value ?? value,
          label: axe,
          selected: existing ? existing.selected : false
        };
      });
    }
  },
  methods: {
    async loadTaxonomy() {
      try {
        const response = await getNavigationStructure(this.useStaging ? 'staging' : 'production');
        if (response?.status !== 'success' || !response.data) {
          throw new Error('Erreur lors de la récupération de la taxonomie');
        }

        const sectorNames = (response.data.sectorNames || []).filter(s => s !== 'Synthèse');
        const initSectors = new Set(this.initialSectors || []);
        this.sectors = sectorNames.map(name => ({
          value: name,
          label: name,
          selected: initSectors.has(name)
        }));

        const syntheseSector = response.data.sectors?.find(s => s.name === 'Synthèse');
        const axeKeys = syntheseSector?.indicateursImpact
          ? Object.keys(syntheseSector.indicateursImpact).filter(axe => axe && axe !== 'Autre')
          : [];
        const axesSet = new Set(axeKeys);
        const initAxes = new Set((this.initialAxes || []).map(a => String(a).trim()));
        this.axes = IMPACT_AXE_DISPLAY_ORDER.filter(axe =>
          axesSet.has(axe) ||
          (axe === 'Économie circulaire' && axesSet.has('Economie circulaire')) ||
          axe === 'Adaptation climat'
        ).map(axe => {
          const value = axesSet.has(axe) ? axe : (axe === 'Économie circulaire' ? 'Economie circulaire' : axe);
          const selected = initAxes.has(axe) || initAxes.has(value);
          return { value, label: axe, selected };
        });
        if (initSectors.size > 0 || initAxes.size > 0) {
          this.$nextTick(() => this.emitSelection());
        }
      } catch (error) {
        console.error('Erreur chargement taxonomie recherche:', error);
      }
    },
    toggleSector(sector) {
      sector.selected = !sector.selected;
      this.emitSelection();
    },
    toggleAxe(axe) {
      const target = this.axes.find(a => a.value === axe.value || a.label === axe.label);
      if (target) {
        target.selected = !target.selected;
      } else {
        this.axes.push({ value: axe.value, label: axe.label, selected: true });
      }
      this.emitSelection();
    },
    emitSelection() {
      const selectedSectors = this.sectors.filter(s => s.selected).map(s => s.value);
      const selectedAxes = this.displayedAxes.filter(a => a.selected).map(a => a.value);
      this.$emit('taxonomy-selected', { sectors: selectedSectors, axes: selectedAxes });
    }
  },
  mounted() {
    this.loadTaxonomy();
  }
};
</script>

<style scoped lang="scss">
.search-taxonomy-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.filter-tag {
  border: 1px solid transparent;
  transition: background-color 0.15s, border-color 0.15s, color 0.15s;

  &--sector {
    background-color: #e3e3fd;
    color: #161616;

    &:hover {
      background-color: #c9c9e6;
    }

    &.filter-tag--selected {
      background-color: #000091;
      color: #fff;
      border-color: #000091;
    }
  }

  &--axe {
    background-color: #e8f5e9;
    color: #161616;

    &:hover {
      background-color: #c8e6c9;
    }

    &.filter-tag--selected {
      background-color: #18753c;
      color: #fff;
      border-color: #18753c;
    }
  }
}
</style>
