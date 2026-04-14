/**
 * Pictogrammes par slug d’axe (= slug du « Nom court » Liste_taxonomie,
 * voir impactAxeSlugFromNomComplet dans csvDataService).
 * Les textes « Ce qu’il faut retenir » viennent de Liste_taxonomie (csvDataService.impactAxeRetenirHtml).
 */
export const IMPACT_AXE_UI_BY_SLUG = {
  attenuation: {
    pictoId: 'environment-tree',
    useEauImage: false,
  },
  adaptation: {
    pictoId: 'environment-sun',
    useEauImage: false,
  },
  biodiversite: {
    pictoId: 'environment-leaf',
    useEauImage: false,
  },
  eau: {
    pictoId: null,
    useEauImage: true,
  },
  pollution: {
    pictoId: 'buildings-factory',
    useEauImage: false,
  },
  'economie-circulaire': {
    pictoId: 'environment-grocery',
    useEauImage: false,
  },
};

export function impactAxeUiForSlug(slug) {
  if (!slug) return null;
  return IMPACT_AXE_UI_BY_SLUG[slug] || null;
}
