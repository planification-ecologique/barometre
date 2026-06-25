/**
 * Tags « Axe taxonomie ».
 * Indicateurs : colonne Grist « Axes taxonomie » (source principale).
 * Navigation chantier/levier : levier > chantier > engagement (fallback si colonne vide).
 */

/** Secours si Liste_leviers indisponible (aligné sur les 4 lignes sans chantier associé). */
export const FALLBACK_META_LEVIERS = [
  "Indicateur d'impact - autres",
  "Indicateur d'impact",
  'Indicateur de chantier',
  'Autres indicateurs',
];

/**
 * Leviers « méta » (Liste_leviers) : lignes sans « Chantier associé ».
 * Ex. Indicateur de chantier, Indicateur d'impact, …
 */
export function metaLeviersFromListeLeviers(levierRows = []) {
  const meta = new Set(FALLBACK_META_LEVIERS);
  for (const row of levierRows) {
    const levier = String(row['clean/strip'] || row.Levier || '').trim();
    const assoc = String(
      row['Chantier associé'] ?? row['Chantier associe'] ?? ''
    ).trim();
    if (levier && !assoc) {
      meta.add(levier);
    }
  }
  return meta;
}

function metaLeviersFromMaps(maps) {
  if (maps?.metaLeviers instanceof Set) {
    return maps.metaLeviers;
  }
  return new Set(FALLBACK_META_LEVIERS);
}

function isMetaLevier(label, maps) {
  const name = String(label || '').trim();
  return name && metaLeviersFromMaps(maps).has(name);
}

const LEVIER_AXE_BOOL_COLUMNS = [
  'Atténuation',
  'Adaptation',
  'Eau',
  'Economie circulaire',
  'Pollution',
  'Biodiversité',
];

function isTruthyCell(value) {
  const s = String(value ?? '').trim().toLowerCase();
  return s === 'true' || s === '1' || s === 'oui' || s === 'yes';
}

/** Colonne « Axes taxonomie » sur une ligne Indicateurs_tableau (CSV brut). */
export function axesTaxonomieFromIndicatorRow(row) {
  if (!row) return [];
  const raw =
    row['Axes taxonomie'] ?? row['Axe taxonomie'] ?? row['Axe_taxonomie'] ?? '';
  return normalizeAxeTaxonomieList(raw);
}

/** Toujours un tableau de libellés (évite crash si Grist renvoie string / objet). */
export function normalizeAxeTaxonomieList(value) {
  if (value == null || value === '') return [];
  if (Array.isArray(value)) {
    return uniqueAxes(value.map((x) => String(x).trim()).filter(Boolean));
  }
  if (typeof value === 'object') {
    return [];
  }
  const parsed = parseAxeTaxonomieCell(value);
  return Array.isArray(parsed) ? parsed : [];
}

export function parseAxeTaxonomieCell(raw) {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return uniqueAxes(raw.map((x) => String(x).trim()).filter(Boolean));
  }
  const s = String(raw).trim();
  if (!s || s.toLowerCase() === 'nan') return [];
  if (s.startsWith('[')) {
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) {
        return parsed.map((x) => String(x).trim()).filter(Boolean);
      }
    } catch {
      /* plain text below */
    }
  }
  return s
    .split(/[,;\n]+/)
    .map((part) => part.trim().replace(/^["']+|["']+$/g, ''))
    .filter(Boolean);
}

function uniqueAxes(list) {
  const seen = new Set();
  const out = [];
  const items = Array.isArray(list) ? list : [];
  for (const raw of items) {
    const label = String(raw || '').trim();
    if (!label) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(label);
  }
  return out;
}

/** Fusionne des listes d’axes sans spread (safe si valeur inattendue). */
export function mergeAxeTaxonomieLists(...parts) {
  const seen = new Set();
  const out = [];
  const add = (label) => {
    const s = String(label ?? '').trim();
    if (!s) return;
    const k = s.toLowerCase();
    if (seen.has(k)) return;
    seen.add(k);
    out.push(s);
  };
  for (const part of parts) {
    for (const axe of normalizeAxeTaxonomieList(part)) {
      add(axe);
    }
  }
  return out;
}

function axesFromLevierRow(row) {
  const fromCell = parseAxeTaxonomieCell(
    row['Axes taxonomie'] ?? row['Axe taxonomie'] ?? row['Axe_taxonomie'] ?? ''
  );
  if (fromCell.length) return fromCell;
  return LEVIER_AXE_BOOL_COLUMNS.filter((col) => isTruthyCell(row[col]));
}

function lookupLevierAxes(maps, sector, chantierOuImpact, levierName) {
  const levier = String(levierName || '').trim();
  if (!levier) return [];
  const chantier = String(chantierOuImpact || '').trim();
  const sect = String(sector || '').trim();
  const assoc =
    sect && chantier ? `${sect} / ${chantier}` : chantier ? chantier : '';
  const keys = [];
  if (assoc) keys.push(`${assoc}::${levier}`);
  keys.push(levier);
  for (const key of keys) {
    const axes = maps.axesByLevier?.get(key);
    if (axes?.length) return axes;
  }
  return [];
}

/**
 * @param {{ levierRows: Array, axesByChantier: Map, engagementRows: Array }} input
 */
export function buildTaxonomyAxeMaps({ levierRows = [], axesByChantier = new Map(), engagementRows = [] }) {
  const metaLeviers = metaLeviersFromListeLeviers(levierRows);
  const axesByLevier = new Map();

  for (const row of levierRows) {
    const levier = String(row['clean/strip'] || row.Levier || '').trim();
    if (!levier || metaLeviers.has(levier)) continue;
    const assoc = String(row['Chantier associé'] || '').trim();
    const axes = axesFromLevierRow(row);
    if (!axes.length) continue;
    if (assoc) axesByLevier.set(`${assoc}::${levier}`, axes);
    if (!axesByLevier.has(levier)) axesByLevier.set(levier, axes);
  }

  const axesByThematique = new Map();
  const axesByEngagement = new Map();
  const axesByImpactAxeLabel = new Map();

  for (const row of engagementRows) {
    const axes = parseAxeTaxonomieCell(row['Axe taxonomie'] ?? row['Axe_taxonomie'] ?? '');
    if (!axes.length) continue;
    const thematique = String(row.Thématique ?? row['Thematique'] ?? '').trim();
    const engagement = String(row.Engagement ?? '').trim();
    if (thematique) axesByThematique.set(thematique, axes);
    if (engagement) axesByEngagement.set(engagement, axes);
    for (const axe of axes) {
      if (!axesByImpactAxeLabel.has(axe)) axesByImpactAxeLabel.set(axe, axes);
    }
  }

  return {
    metaLeviers,
    axesByLevier,
    axesByChantier,
    axesByThematique,
    axesByEngagement,
    axesByImpactAxeLabel,
  };
}

/**
 * Résolution pour un couple secteur / chantier / levier / engagement.
 */
export function resolveTaxonomyAxeTags(
  { sector, chantierOuImpact, levier, engagement },
  maps
) {
  if (!maps) return [];

  const leviers = Array.isArray(levier)
    ? levier
    : String(levier || '')
        .split(/,(?=\s*Indicateur)/)
        .map((p) => p.trim())
        .filter(Boolean);

  const namedLevier = leviers.find((l) => l && !isMetaLevier(l.trim(), maps));
  if (namedLevier) {
    const axes = lookupLevierAxes(maps, sector, chantierOuImpact, namedLevier);
    if (axes.length) return uniqueAxes(axes);
  }

  const chantier = String(chantierOuImpact || '').trim();
  if (chantier) {
    const fromChantier = maps.axesByChantier?.get(chantier);
    if (fromChantier?.length) return uniqueAxes(fromChantier);
  }

  const eng = String(engagement || '').trim();
  if (eng) {
    const fromEng =
      maps.axesByThematique?.get(eng) || maps.axesByEngagement?.get(eng);
    if (fromEng?.length) return uniqueAxes(fromEng);
  }

  if (chantier) {
    const fromImpactAxe = maps.axesByImpactAxeLabel?.get(chantier);
    if (fromImpactAxe?.length) return uniqueAxes(fromImpactAxe);
    if (parseAxeTaxonomieCell(chantier).length) return uniqueAxes(parseAxeTaxonomieCell(chantier));
  }

  return [];
}

function zipSectorChantierAssociations(item) {
  const sectors = Array.isArray(item.sector_list) && item.sector_list.length
    ? item.sector_list
    : [item.sector || ''].filter(Boolean);
  const chantiers = Array.isArray(item.chantier_ou_impact_list) && item.chantier_ou_impact_list.length
    ? item.chantier_ou_impact_list
    : [item.chantier_ou_impact || item.chantierOuImpact || ''].filter(Boolean);
  const len = Math.max(sectors.length, chantiers.length, 1);
  const pairs = [];
  for (let i = 0; i < len; i++) {
    pairs.push({
      sector: sectors[i] ?? sectors[0] ?? '',
      chantierOuImpact: chantiers[i] ?? chantiers[0] ?? '',
    });
  }
  return pairs;
}

/**
 * Tags pour un indicateur (GraphBox, exports CSV).
 */
export function resolveIndicatorTaxonomyAxeTags(item, maps) {
  if (!item || !maps) return [];

  const engagement = String(
    item.engagement || item.Engagement || item['Ambition liée'] || ''
  ).trim();
  const leviers = item.levier_list || item.levier || item.Levier || '';
  const associations = zipSectorChantierAssociations(item);

  const namedLevier = (Array.isArray(leviers) ? leviers : String(leviers).split(/,(?=\s*Indicateur)/))
    .map((l) => String(l).trim())
    .find((l) => l && !isMetaLevier(l, maps));

  if (namedLevier) {
    for (const { sector, chantierOuImpact } of associations) {
      const axes = resolveTaxonomyAxeTags(
        { sector, chantierOuImpact, levier: namedLevier, engagement },
        maps
      );
      if (axes.length) return axes;
    }
  }

  const seen = new Set();
  const merged = [];
  for (const { sector, chantierOuImpact } of associations) {
    const axes = resolveTaxonomyAxeTags(
      { sector, chantierOuImpact, levier: leviers, engagement },
      maps
    );
    for (const axe of axes) {
      const key = axe.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(axe);
      }
    }
  }
  return merged;
}
