<template>
  <svg
    class="dsfr-pictogram fr-artwork"
    viewBox="0 0 80 80"
    :width="sizePx"
    :height="sizePx"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <template v-if="baseUrl">
      <use class="fr-artwork-decorative" :href="frag('artwork-decorative')" />
      <use class="fr-artwork-minor" :href="frag('artwork-minor')" />
      <use class="fr-artwork-major" :href="frag('artwork-major')" />
    </template>
  </svg>
</template>

<script>
/**
 * Pictogramme DSFR (dist officiel) — références externes + fragments #artwork-*.
 * @see https://www.systeme-de-design.gouv.fr/elements-d-interface/fondamentaux-de-l-identite-de-l-etat/pictogramme
 */
const ASSETS = {
  'environment-tree': require('@gouvfr/dsfr/dist/artwork/pictograms/environment/tree.svg'),
  'environment-sun': require('@gouvfr/dsfr/dist/artwork/pictograms/environment/sun.svg'),
  'environment-leaf': require('@gouvfr/dsfr/dist/artwork/pictograms/environment/leaf.svg'),
  'environment-food': require('@gouvfr/dsfr/dist/artwork/pictograms/environment/food.svg'),
  'environment-grocery': require('@gouvfr/dsfr/dist/artwork/pictograms/environment/grocery.svg'),
  'environment-human-cooperation': require('@gouvfr/dsfr/dist/artwork/pictograms/environment/human-cooperation.svg'),
  'environment-environment': require('@gouvfr/dsfr/dist/artwork/pictograms/environment/environment.svg'),
  'buildings-factory': require('@gouvfr/dsfr/dist/artwork/pictograms/buildings/factory.svg'),
  'buildings-house': require('@gouvfr/dsfr/dist/artwork/pictograms/buildings/house.svg'),
  'digital-application': require('@gouvfr/dsfr/dist/artwork/pictograms/digital/application.svg'),
  'map-map': require('@gouvfr/dsfr/dist/artwork/pictograms/map/map.svg')
}

export default {
  name: 'DsfrPictogram',
  props: {
    /** Clé dans ASSETS (ex. environment-tree) */
    pictoId: {
      type: String,
      required: true
    },
    /** Taille du côté (px) */
    size: {
      type: [Number, String],
      default: 56
    }
  },
  computed: {
    baseUrl() {
      return ASSETS[this.pictoId] || ''
    },
    sizePx() {
      const n = typeof this.size === 'number' ? this.size : parseInt(String(this.size), 10)
      return Number.isFinite(n) && n > 0 ? n : 56
    }
  },
  methods: {
    frag(id) {
      return this.baseUrl ? `${this.baseUrl}#${id}` : ''
    }
  }
}
</script>

<style scoped>
.dsfr-pictogram {
  display: block;
  flex-shrink: 0;
}
</style>
