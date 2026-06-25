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
import {
  compareImpactAxeLabelsTaxonomie,
  impactAxeNomCourt,
} from '@/services/csvDataService.js';
import { normalizeAxeTaxonomieList } from '@/utils/taxonomyAxeTags.js';

function asStringList(value) {
  if (Array.isArray(value)) return value;
  if (value == null || value === '') return [];
  return [value];
}

function dedupeStrings(values) {
  const seen = Object.create(null);
  const out = [];
  for (const raw of asStringList(values)) {
    const s = String(raw ?? '').trim();
    if (!s) continue;
    const key = s.toLowerCase();
    if (seen[key]) continue;
    seen[key] = true;
    out.push(s);
  }
  return out;
}

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

      const sectors = asStringList(this.dataObj.sector_list).filter(
        (s) => s && s !== 'Synthèse'
      );
      const uniqueSectors = dedupeStrings(sectors);
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

      const axeLabels = normalizeAxeTaxonomieList(this.dataObj.axe_taxonomie_list);
      const seenAxeSlugs = Object.create(null);
      const axeTags = [];
      axeLabels.forEach((raw) => {
        const canonical = resolveImpactAxeCanonicalFromLabel(raw) || raw;
        const slug = impactAxeNameToSlug(canonical);
        if (!slug || seenAxeSlugs[slug]) return;
        seenAxeSlugs[slug] = true;
        axeTags.push({
          type: 'axe',
          value: canonical,
          label: impactAxeNomCourt(canonical) || raw,
          href: {
            name: this.etatName,
            query: { section: slug },
          },
        });
      });
      axeTags.sort((a, b) =>
        compareImpactAxeLabelsTaxonomie(a.label, b.label)
      );
      result.push(...axeTags);

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
