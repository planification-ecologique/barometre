export const BASE_URL = process.env.VUE_APP_API_URL;

export async function api(url, params = {}) {
  let mytoken = '';

  try {
    if (process.env.VUE_APP_KEYCLOAK_AVAILABLE === "true") {
      const rawToken = localStorage.getItem("vue-token");

      if (rawToken) {
        mytoken = rawToken.replaceAll('"', '');
      } else {
        console.warn("No token found in localStorage.");
      }
    }
  } catch (error) {
    console.error("Error getting token: ", error);
  }

  params = Object.assign(
    {
      mode: "cors",
      cache: "no-cache",
    },
    params
  );

  params.headers = Object.assign(
    {
      Authorization: `Bearer ${mytoken}`,
      "Content-Type": "application/json",
    },
    params.headers
  );

  const response = await fetch(BASE_URL + url, params);

  let json;
  try {
    json = await response.json();
  } catch (err) {
    json = {};
  }

  if (!response.ok) {
    const errorMessage = json.error || response.status;
    throw new Error(errorMessage);
  }

  return json;
}
