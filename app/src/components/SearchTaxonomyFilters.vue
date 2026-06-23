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
        :title="sector.value"
        @click="toggleSector(sector)"
      >
        <span
          v-if="sector.selected"
          class="filter-tag__check-badge"
          aria-hidden="true"
        >✓</span>
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
        :title="axe.value || axe.label"
        @click="toggleAxe(axe)"
      >
        <span
          v-if="axe.selected"
          class="filter-tag__check-badge"
          aria-hidden="true"
        >✓</span>
        <span class="filter-tag__label">{{ axe.label }}</span>
      </button>
      <slot name="extra-filters" />
    </div>
  </div>
</template>

<script>
import { chantierSectorNomMieux } from '@/config/sectorMieuxLabels.js';
import {
  getNavigationStructure,
  IMPACT_AXE_DISPLAY_ORDER,
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
      const rank = (value) => {
        if (order.has(value)) return order.get(value);
        if (value === 'Economie circulaire') return order.get('Économie circulaire') ?? 999;
        return 999;
      };
      return [...this.axes].sort((a, b) => rank(a.value) - rank(b.value));
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
          label: chantierSectorNomMieux(name),
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
          return { value, label: impactAxeNomCourt(axe), selected };
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
