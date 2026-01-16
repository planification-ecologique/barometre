// Utility to map sector names to their corresponding icon components
// This ensures consistency across all components

import EnvironnementImg from '@/components/components_sgv/EnvironnementImg.vue'
import TransportImg from '@/components/components_sgv/TransportImg.vue'
import AgricultureImg from '@/components/components_sgv/AgricultureImg.vue'
import IndustrieImg from '@/components/components_sgv/IndustrieImg.vue'
import BatimentImg from '@/components/components_sgv/BatimentImg.vue'
import EnergieImg from '@/components/components_sgv/EnergieImg.vue'
import EconomieImg from '@/components/components_sgv/EconomieImg.vue'
import EcosystemeImg from '@/components/components_sgv/EcosystemeImg.vue'

/**
 * Maps sector names to their corresponding icon components
 */
export const sectorIconMap = {
  'Général': EnvironnementImg,
  'Transports': TransportImg,
  'Agriculture / alimentation': AgricultureImg,
  'Industrie': IndustrieImg,
  'Bâtiments et urbanisme': BatimentImg,
  "Production d'énergie": EnergieImg,
  'Consommations et déchets': EconomieImg,
  'Terres et forêts': EcosystemeImg,
}

/**
 * Get the icon component for a given sector name
 * @param {string} sectorName - The name of the sector
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
