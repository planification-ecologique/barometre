const RESULT_LIMIT = 80;

export function foldSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function sortIndicatorsByLabel(graphs) {
  return [...(graphs || [])].sort((a, b) =>
    String(a.label_indic || "").localeCompare(String(b.label_indic || ""), "fr")
  );
}

/**
 * Text search over indicator label and id.
 * @param {object[]} graphs
 * @param {string} query
 * @returns {{ matches: object[], hiddenCount: number }}
 */
export function filterIndicatorOptions(graphs, query) {
  const sorted = sortIndicatorsByLabel(graphs);
  const needle = foldSearchText(query).trim();
  const matches = needle
    ? sorted.filter((graph) => {
        const label = foldSearchText(graph.label_indic);
        const id = foldSearchText(graph.id_indic);
        return label.includes(needle) || id.includes(needle);
      })
    : sorted;
  return {
    matches: matches.slice(0, RESULT_LIMIT),
    hiddenCount: Math.max(0, matches.length - RESULT_LIMIT),
  };
}
