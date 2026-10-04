import {
  filterFrenchTerritoryRows,
  isFrenchTerritoryGeocode,
  normalizeGeocode,
} from "@/services/frenchRegions";
import {
  ensureRegionQuery,
  regionQueryRedirect,
  regionSelection,
  setSharedRegion,
} from "@/services/regionSelection";

describe("frenchRegions", () => {
  it("keeps French regions and overseas territories", () => {
    expect(isFrenchTerritoryGeocode("84")).toBe(true);
    expect(isFrenchTerritoryGeocode("1")).toBe(true);
    expect(isFrenchTerritoryGeocode("0")).toBe(true);
    expect(normalizeGeocode("1")).toBe("01");
    expect(normalizeGeocode("0")).toBe("0");
  });

  it("drops foreign countries and unspecified rows", () => {
    const rows = [
      { "cube.geocode_region": "84", "cube.libelle_region": "Auvergne-Rhône-Alpes" },
      { "cube.geocode_region": "IT", "cube.libelle_region": "Italie" },
      { "cube.geocode_region": "99", "cube.libelle_region": "Non précisé" },
      { "cube.geocode_region": "0", "cube.libelle_region": "Collectivités d'outre-mer" },
      { "cube.geocode_region": "DE", "cube.libelle_region": "Allemagne" },
    ];

    expect(filterFrenchTerritoryRows(rows).map((row) => row["cube.geocode_region"])).toEqual([
      "84",
      "0",
    ]);
  });
});

describe("regionSelection", () => {
  afterEach(() => {
    regionSelection.code = "";
  });

  it("stores an allowed region and writes it on the route", () => {
    const router = {
      currentRoute: { query: { section: "synthese" } },
      replace: jest.fn(() => Promise.resolve()),
    };

    setSharedRegion(router, "84");

    expect(regionSelection.code).toBe("84");
    expect(router.replace).toHaveBeenCalledWith({
      query: { section: "synthese", region: "84" },
    });
  });

  it("clears unknown codes", () => {
    const router = {
      currentRoute: { query: { region: "84" } },
      replace: jest.fn(() => Promise.resolve()),
    };

    setSharedRegion(router, "IT");

    expect(regionSelection.code).toBe("");
    expect(router.replace).toHaveBeenCalledWith({ query: {} });
  });

  it("reads a valid region from the URL and strips a foreign one", () => {
    expect(regionQueryRedirect({ path: "/recherche", query: { region: "11", q: "eau" }, hash: "" })).toBeNull();
    expect(regionSelection.code).toBe("11");

    expect(regionQueryRedirect({ path: "/recherche", query: { region: "IT" }, hash: "" })).toEqual({
      path: "/recherche",
      query: {},
      hash: "",
      replace: true,
    });
  });

  it("puts the current territory back when a navigation drops it", () => {
    regionSelection.code = "53";
    const router = { replace: jest.fn(() => Promise.resolve()) };

    ensureRegionQuery(router, { query: { section: "synthese" } });

    expect(router.replace).toHaveBeenCalledWith({
      query: { section: "synthese", region: "53" },
    });
  });
});
