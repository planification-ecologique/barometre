import { keepTerritoiresNavigation } from "@/config/routeNames";

const fromTerritoires = { path: "/territoires", name: "territoires" };

describe("keepTerritoiresNavigation", () => {
  it("keeps Etat de l'environnement under /territoires", () => {
    expect(
      keepTerritoiresNavigation(
        { name: "etat-environnement", query: { section: "synthese" } },
        fromTerritoires
      )
    ).toMatchObject({
      name: "territoires",
      query: { section: "synthese", view: "etat-environnement" },
    });
  });

  it("keeps chantiers on the territoires route", () => {
    expect(
      keepTerritoiresNavigation(
        { name: "chantiers", query: { section: "synthese" } },
        fromTerritoires
      )
    ).toMatchObject({
      name: "territoires",
      query: { section: "synthese" },
    });
  });

  it("keeps recherche and favoris under /territoires", () => {
    expect(
      keepTerritoiresNavigation({ name: "recherche", query: {} }, fromTerritoires)
    ).toMatchObject({ name: "territoires-recherche" });
    expect(
      keepTerritoiresNavigation({ name: "favoris", query: {} }, fromTerritoires)
    ).toMatchObject({ name: "territoires-favoris" });
  });

  it("lets Accueil leave the shell", () => {
    expect(
      keepTerritoiresNavigation({ name: "home", query: {} }, fromTerritoires)
    ).toBeNull();
  });

  it("does nothing outside /territoires", () => {
    expect(
      keepTerritoiresNavigation(
        { name: "etat-environnement", query: { section: "synthese" } },
        { path: "/chantiers", name: "chantiers" }
      )
    ).toBeNull();
  });
});