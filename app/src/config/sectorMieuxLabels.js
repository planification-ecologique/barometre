/**
 * Libellés « Mieux … » des thématiques chantiers (SGPE / France Nation Verte).
 * Les données Grist utilisent les noms courts (Se déplacer, Se loger, …).
 */
/** Libellés d'affichage pour secteurs / thèmes (clé métier inchangée). */
const SECTOR_DISPLAY_LABEL_OVERRIDES = {
  Transverse: 'Objectifs transverses',
};

export const CHANTIER_SECTOR_TO_MIEUX = {
  'Se déplacer': 'Mieux se déplacer',
  'Se loger': 'Mieux se loger',
  'Se nourrir': 'Mieux se nourrir',
  Produire: 'Mieux produire',
  Consommer: 'Mieux consommer',
  Préserver: 'Mieux préserver et valoriser nos écosystèmes',
};

/**
 * Nom chantier / secteur (données) → libellé d'affichage SGPE.
 * Retombe sur le libellé d'origine si inconnu (ex. Synthèse).
 */
export function chantierSectorNomMieux(sectorName) {
  if (!sectorName) return '';
  const key = String(sectorName).trim();
  if (CHANTIER_SECTOR_TO_MIEUX[key]) return CHANTIER_SECTOR_TO_MIEUX[key];
  if (key.includes('Préserver') && key.includes('écosystèmes')) {
    return CHANTIER_SECTOR_TO_MIEUX.Préserver;
  }
  return key;
}

/** Secteur ou thème (données) → libellé affiché. */
export function sectorDisplayLabel(sectorOrThemeName) {
  if (!sectorOrThemeName) return '';
  const key = String(sectorOrThemeName).trim();
  if (SECTOR_DISPLAY_LABEL_OVERRIDES[key]) return SECTOR_DISPLAY_LABEL_OVERRIDES[key];
  return chantierSectorNomMieux(key);
}

/** Fallback si `Description secteur` absente dans Liste_chantiers (Grist). */
export const SECTOR_DESCRIPTIONS = {
  Consommer:
    "Le secteur « Mieux consommer » traite de l'économie circulaire, de la réduction des déchets et de la transformation des modes de consommation vers plus de sobriété.",
  Préserver:
    'Le secteur « Mieux préserver et valoriser nos écosystèmes » concerne la préservation des espaces naturels et des ressources en eaux',
  Produire:
    "Le secteur « Mieux produire » concerne la décarbonation de l'industrie, le développement des énergies renouvelables et la transformation des procédés industriels.",
  'Se déplacer':
    "Le secteur « Mieux se déplacer » couvre les déplacements de voyageurs et de marchandises, pour l'ensemble des modes de transports (terrestres, aériens, maritimes et fluviaux).",
  'Se loger':
    'Le secteur « Mieux se loger » traite du bâtiment : rénovation énergétique, construction et exploitations durables ainsi que prévention et protection contre les risques.',
  'Se nourrir':
    "Le secteur « Mieux se nourrir » couvre l'ensemble de la chaîne alimentaire, de la production agricole à la consommation, en passant par la transformation et la distribution.",
};

/**
 * Description secteur : Grist (`Description secteur`) puis fallback SECTOR_DESCRIPTIONS.
 */
export function resolveSectorDescription(sectorName, gristDescriptions) {
  const key = String(sectorName || '').trim();
  if (!key) return '';
  const fromGrist = gristDescriptions?.get?.(key);
  if (fromGrist) return fromGrist;
  return SECTOR_DESCRIPTIONS[key] || '';
}
