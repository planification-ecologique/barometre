<template>
  <div v-if="tags.length > 0" class="taxonomy-tags-card">
    <ul class="fr-tags-group taxonomy-tags-list">
      <li v-for="tag in tags" :key="tag.type + '-' + tag.value">
        <router-link
          :to="tag.href"
          class="fr-tag taxonomy-tag"
          :class="'taxonomy-tag--' + tag.type"
        >
          {{ tag.label }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import { etatEnvironnementRouteName, chantiersRouteName } from '@/config/routeNames.js';
import { SECTION_SYNTHESE_SLUG, toSectionSlug } from '@/utils/sectionUrl.js';
import {
  impactAxeNameToSlug,
  resolveImpactAxeCanonicalFromLabel,
} from '@/utils/impactAxeUrl.js';

export default {
  name: 'TaxonomyTagsCard',
  props: {
    /** Indicator data object with sector_list and chantier_ou_impact_list */
    dataObj: {
      type: Object,
      default: null
    },
    useStaging: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    etatName() {
      return etatEnvironnementRouteName(this.useStaging);
    },
    chantiersName() {
      return chantiersRouteName(this.useStaging);
    },
    tags() {
      if (!this.dataObj) return [];
      const result = [];

      const sectors = (this.dataObj.sector_list || []).filter(s => s !== 'Synthèse');
      const uniqueSectors = [...new Set(sectors)].filter(Boolean);
      uniqueSectors.forEach(sector => {
        const slug = toSectionSlug(sector)
        result.push({
          type: 'sector',
          value: sector,
          label: sector,
          href: {
            name: this.chantiersName,
            query: { section: SECTION_SYNTHESE_SLUG },
            hash: `#sector-${slug}`,
          },
        });
      });

      const chantierOuImpact = this.dataObj.chantier_ou_impact_list || [];
      const seenAxeSlugs = new Set();
      chantierOuImpact.filter(Boolean).forEach((raw) => {
        const canonical = resolveImpactAxeCanonicalFromLabel(raw);
        if (!canonical) return;
        const slug = impactAxeNameToSlug(canonical);
        if (seenAxeSlugs.has(slug)) return;
        seenAxeSlugs.add(slug);
        result.push({
          type: 'axe',
          value: canonical,
          label: raw,
          href: {
            name: this.etatName,
            query: { section: slug },
          },
        });
      });

      return result;
    }
  },
};
</script>

<style scoped lang="scss">
.taxonomy-tags-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
  line-height: 1;

  li {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    align-items: center;
  }
}

.taxonomy-tag {
  margin: 0 !important;
  display: inline-flex;
  align-items: center;
  line-height: 1;
  text-decoration: none;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  transition: background-color 0.15s, color 0.15s;

  &--sector {
    background-color: #e3e3fd;
    color: #161616;

    &:hover {
      background-color: #000091;
      color: #fff;
    }
  }

  &--axe {
    background-color: #e8f5e9;
    color: #161616;

    &:hover {
      background-color: #18753c;
      color: #fff;
    }
  }
}
</style>
