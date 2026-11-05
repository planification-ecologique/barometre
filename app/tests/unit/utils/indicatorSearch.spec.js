import { filterIndicatorOptions } from "@/utils/indicatorSearch";

const graphs = [
  { id_indic: 12, label_indic: "Part modale du vélo" },
  { id_indic: 4, label_indic: "Émissions de gaz à effet de serre" },
  { id_indic: 40, label_indic: "Artificialisation" },
];

describe("filterIndicatorOptions", () => {
  it("matches label text without accents", () => {
    const { matches } = filterIndicatorOptions(graphs, "emissions");
    expect(matches.map((graph) => graph.id_indic)).toEqual([4]);
  });

  it("matches an indicator id", () => {
    const { matches } = filterIndicatorOptions(graphs, "12");
    expect(matches.map((graph) => graph.id_indic)).toEqual([12]);
  });

  it("sorts an empty query by label", () => {
    const { matches, hiddenCount } = filterIndicatorOptions(graphs, "");
    expect(matches.map((graph) => graph.label_indic)).toEqual([
      "Artificialisation",
      "Émissions de gaz à effet de serre",
      "Part modale du vélo",
    ]);
    expect(hiddenCount).toBe(0);
  });
});
