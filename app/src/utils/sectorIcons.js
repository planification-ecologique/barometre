// Utility to map sector names (from CSV: Synthèse, Se nourrir, Se loger, etc.) to their icon components

import EnvironnementImg from '@/components/components_sgv/EnvironnementImg.vue'
import TransportImg from '@/components/components_sgv/TransportImg.vue'
import AgricultureImg from '@/components/components_sgv/AgricultureImg.vue'
import IndustrieImg from '@/components/components_sgv/IndustrieImg.vue'
import BatimentImg from '@/components/components_sgv/BatimentImg.vue'
import EconomieImg from '@/components/components_sgv/EconomieImg.vue'
import EcosystemeImg from '@/components/components_sgv/EcosystemeImg.vue'

/**
 * Maps sector names (from CSV) to their corresponding icon components
 */
export const sectorIconMap = {
  'Synthèse': EnvironnementImg,
  'Se nourrir': AgricultureImg,
  'Se loger': BatimentImg,
  'Consommer': EconomieImg,
  'Produire': IndustrieImg,
  'Préserver': EcosystemeImg,
  'Se déplacer': TransportImg,
}

/**
 * Get the icon component for a given sector name
 * @param {string} sectorName - The name of the sector (from CSV)
 * @returns {Object|null} The Vue component for the icon, or null if not found
 */
export function getSectorIcon(sectorName) {
  return sectorIconMap[sectorName] || null
}

/**
 * Get all sector icon mappings
 * @returns {Object} Object mapping sector names to icon components
 */
export function getAllSectorIcons() {
  return sectorIconMap
}

export default {
  sectorIconMap,
  getSectorIcon,
  getAllSectorIcons,
}
