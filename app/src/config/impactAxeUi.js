/**
 * Textes et pictogrammes par slug d’axe (= slug du « Nom court » Liste_taxonomie,
 * voir impactAxeSlugFromNomComplet dans csvDataService).
 */
export const IMPACT_AXE_UI_BY_SLUG = {
  attenuation: {
    description:
      "Les indicateurs d'atténuation suivent la réduction des émissions de gaz à effet de serre et la transition vers une économie bas-carbone.",
    pictoId: 'environment-tree',
    useEauImage: false,
  },
  adaptation: {
    description:
      "Les indicateurs d'adaptation mesurent la capacité de la société et des territoires à faire face aux effets du changement climatique.",
    pictoId: 'environment-sun',
    useEauImage: false,
  },
  biodiversite: {
    description:
      "Les indicateurs de biodiversité suivent l'état des écosystèmes, des espèces et des habitats naturels.",
    pictoId: 'environment-leaf',
    useEauImage: false,
  },
  eau: {
    description:
      "Les indicateurs liés à l'eau suivent la qualité et la gestion durable des ressources en eau.",
    pictoId: null,
    useEauImage: true,
  },
  pollution: {
    description:
      "Les indicateurs de pollution mesurent la qualité de l'air, des sols et l'exposition aux substances nocives.",
    pictoId: 'buildings-factory',
    useEauImage: false,
  },
  'economie-circulaire': {
    description:
      "Les indicateurs d'économie circulaire suivent la réduction des déchets, le recyclage et la sobriété des ressources.",
    pictoId: 'environment-grocery',
    useEauImage: false,
  },
};

export function impactAxeUiForSlug(slug) {
  if (!slug) return null;
  return IMPACT_AXE_UI_BY_SLUG[slug] || null;
}
