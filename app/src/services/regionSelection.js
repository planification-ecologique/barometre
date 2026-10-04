import Vue from "vue";
import { isFrenchTerritoryGeocode, normalizeGeocode } from "@/services/frenchRegions";

/** App-wide territory. Empty string means National. */
export const regionSelection = Vue.observable({
  code: "",
});

function queryRegionValue(query) {
  const raw = query && query.region;
  if (Array.isArray(raw)) return raw[0];
  return raw;
}

/**
 * Publish a territory and mirror it on the current URL (`?region=`).
 * Unknown codes clear the selection.
 */
export function setSharedRegion(router, code) {
  const normalized = normalizeGeocode(code);
  const allowed = normalized && isFrenchTerritoryGeocode(normalized) ? normalized : "";
  const currentQuery =
    router && router.currentRoute
      ? String(queryRegionValue(router.currentRoute.query) || "")
      : null;

  regionSelection.code = allowed;
  if (!router || !router.currentRoute || currentQuery === allowed) return;

  const query = { ...router.currentRoute.query };
  if (allowed) query.region = allowed;
  else delete query.region;
  router.replace({ query }).catch(() => {});
}

/**
 * Read `?region=` into the shared selection.
 * Returns a redirect when the query is invalid or not normalized, otherwise null.
 */
export function regionQueryRedirect(to) {
  const raw = queryRegionValue(to.query);
  const hasRegion = raw != null && String(raw) !== "";
  if (!hasRegion) return null;

  const normalized = normalizeGeocode(raw);
  if (!isFrenchTerritoryGeocode(normalized)) {
    const query = { ...to.query };
    delete query.region;
    return { path: to.path, query, hash: to.hash, replace: true };
  }

  regionSelection.code = normalized;
  if (String(raw) !== normalized) {
    return {
      path: to.path,
      query: { ...to.query, region: normalized },
      hash: to.hash,
      replace: true,
    };
  }
  return null;
}

/** Put the current territory back on a URL that dropped it. */
export function ensureRegionQuery(router, to) {
  if (!regionSelection.code || !router || !to) return;
  const raw = queryRegionValue(to.query);
  if (raw != null && String(raw) !== "") return;
  const query = { ...to.query, region: regionSelection.code };
  router.replace({ query }).catch(() => {});
}
