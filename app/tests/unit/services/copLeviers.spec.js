import {
  assembleTerritoireSectors,
  copLeverMeta,
  geocodesWithMeasure,
  groupIndicatorsIntoSectors,
  resolveCopLever,
} from "@/services/copLeviers";

describe("copLeviers", () => {
  it("places a Grist COP label in its theme", () => {
    expect(copLeverMeta("Vélo")).toMatchObject({
      name: "Vélo",
      theme: "Mieux se déplacer",
    });
  });

  it("keeps a renamed Grist label and still finds the theme", () => {
    expect(copLeverMeta("Transports en commun")).toMatchObject({
      name: "Transports en commun",
      theme: "Mieux se déplacer",
    });
    expect(copLeverMeta("Lois Egalim et Climat & résilience").theme).toBe("Mieux se nourrir");
  });

  it("groups indicators by the Grist column, not the barometer lever", () => {
    const sectors = groupIndicatorsIntoSectors([
      {
        id_indic: "1",
        label_indic: "Part du vélo",
        levier_cop: "Vélo",
        levier_list: ["Indicateur de chantier"],
      },
      {
        id_indic: "2",
        label_indic: "Hors levier",
        levier_cop: "",
        levier_list: ["Développement des mobilités actives (vélo et marche)"],
      },
    ]);
    expect(sectors.map((sector) => sector.name)).toEqual(["Mieux se déplacer"]);
    expect(sectors[0].chantiers.map((chantier) => chantier.name)).toEqual(["Vélo"]);
    expect(sectors[0].chantiers[0].gristIds).toEqual(["1"]);
    expect(sectors[0].indicatorCount).toBe(1);
  });

  it("groups levers when Map iterators are missing", () => {
    const keys = Map.prototype.keys;
    const values = Map.prototype.values;
    Map.prototype.keys = undefined;
    Map.prototype.values = undefined;
    try {
      const sectors = groupIndicatorsIntoSectors([
        { id_indic: "1", label_indic: "Part du vélo", levier_cop: "Vélo" },
        {
          id_indic: "3",
          label_indic: "Rénovation",
          levier_cop: "Rénovation (résidentiel)",
        },
      ]);
      expect(sectors.map((sector) => sector.name)).toEqual([
        "Mieux se déplacer",
        "Mieux se loger",
      ]);
      expect(sectors[1].chantiers.map((chantier) => chantier.name)).toEqual([
        "Rénovation (résidentiel)",
      ]);
    } finally {
      Map.prototype.keys = keys;
      Map.prototype.values = values;
    }
  });

  it("files a baromètre lever under the COP hat of its chantier", () => {
    expect(
      resolveCopLever({
        leverName: "Pistes cyclables",
        chantierName: "Développement des mobilités actives (vélo et marche)",
      })
    ).toMatchObject({ name: "Vélo", theme: "Mieux se déplacer" });
  });

  it("keeps every baromètre series under the COP tree", () => {
    const sectors = assembleTerritoireSectors([
      {
        name: "Se déplacer",
        chantiers: {
          "Développement des mobilités actives (vélo et marche)": {
            sortedLeviers: [
              {
                name: "Indicateur de chantier",
                indicators: [{ gristId: "1", indicator: {} }],
              },
              {
                name: "Pistes cyclables",
                objectifLevier: "Plus de pistes",
                indicators: [{ gristId: "2", indicator: { "IRPE ids": "" } }],
              },
            ],
          },
        },
      },
    ]);
    expect(sectors.map((sector) => sector.name)).toEqual(["Mieux se déplacer"]);
    const hat = sectors[0].chantiers[0];
    expect(hat.name).toBe("Vélo");
    expect(hat.gristIds).toEqual(["1", "2"]);
    expect(hat.sortedLeviers.map((lever) => lever.name)).toEqual([
      "Indicateur de chantier",
      "Pistes cyclables",
    ]);
    expect(hat.levierCount).toBe(1);
  });

  it("keeps geocodes that have a measure", () => {
    const codes = geocodesWithMeasure({
      measureName: "cube.id_1",
      data: [
        { "cube.geocode_region": "53", "cube.id_1": 12 },
        { "cube.geocode_region": "1", "cube.id_1": 3 },
        { "cube.geocode_region": "06", "cube.id_1": null },
        { "cube.geocode_region": "IT", "cube.id_1": 9 },
      ],
    });
    expect([...codes].sort()).toEqual(["01", "53", "IT"]);
  });
});
