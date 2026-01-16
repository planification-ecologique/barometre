<template>
  <div class="sector-icon-container" v-if="iconComponent">
    <component
      :is="iconComponent"
      :width="width"
      :height="height"
    />
  </div>
</template>

<script>
import { getSectorIcon } from '@/utils/sectorIcons.js'

export default {
  name: 'SectorIcon',
  props: {
    sector: {
      type: String,
      required: true
    },
    width: {
      type: String,
      default: '100px'
    },
    height: {
      type: String,
      default: '100px'
    }
  },
  computed: {
    iconComponent() {
      return getSectorIcon(this.sector)
    }
  }
}
</script>

<style scoped>
.sector-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
