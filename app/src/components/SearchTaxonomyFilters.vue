<template>
  <div class="search-taxonomy-filters">
    <div v-if="sectors.length > 0" class="filter-row">
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
        <span
          v-if="sector.selected"
          class="filter-tag__check-badge"
          aria-hidden="true"
        >
          <span class="fr-icon-check-line" aria-hidden="true" />
        </span>
        <span class="filter-tag__label">{{ sector.label }}</span>
      </button>
    </div>
    <div
      v-if="displayedAxes.length > 0 || $slots['extra-filters']"
      class="filter-row"
    >
      <button
        v-for="axe in displayedAxes"
        :key="'axe-' + axe.value"
        type="button"
        class="fr-tag filter-tag filter-tag--axe"
        :class="{ 'filter-tag--selected': axe.selected }"
        :aria-pressed="axe.selected"
        :title="axe.value"
        @click="toggleAxe(axe)"
      >
        <span
          v-if="axe.selected"
          class="filter-tag__check-badge"
          aria-hidden="true"
        >
          <span class="fr-icon-check-line" aria-hidden="true" />
        </span>
        <span class="filter-tag__label">{{ axe.label }}</span>
      </button>
      <slot name="extra-filters" />
    </div>
  </div>
</template>

<script>
import {
  getNavigationStructure,
  IMPACT_AXE_DISPLAY_ORDER,
  collectSearchImpactAxes,
  impactAxeNomCourt
} from '@/services/csvDataService.js';

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
      const order = new Map(IMPACT_AXE_DISPLAY_ORDER.map((axe, i) => [axe, i]));
      return [...this.axes].sort(
        (a, b) => (order.get(a.value) ?? 999) - (order.get(b.value) ?? 999)
      );
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

        const availableAxes = collectSearchImpactAxes(response.data);
        const initAxes = new Set((this.initialAxes || []).map(a => String(a).trim()));
        this.axes = IMPACT_AXE_DISPLAY_ORDER.filter((axe) => availableAxes.has(axe)).map((axe) => ({
          value: axe,
          label: impactAxeNomCourt(axe),
          selected: initAxes.has(axe)
        }));
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
@import '@/css/search-filter-chips.scss';

.search-taxonomy-filters {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  padding-top: 0.375rem;
  padding-right: 0.375rem;

  :deep(.filter-tag) {
    margin: 0;
  }
}
</style>
