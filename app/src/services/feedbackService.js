const FEEDBACK_API_URL =
  'https://europe-west1-barometre-sgpe.cloudfunctions.net/submitFeedback'

/**
 * @param {{
 *   raison: 'bug' | 'suggestion' | 'donnee_fausse',
 *   type?: 'utilisateur' | 'operateur',
 *   commentaire: string,
 *   email: string,
 *   url_page?: string,
 *   website?: string,
 * }} payload
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function submitFeedback(payload) {
  try {
    const response = await fetch(FEEDBACK_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (response.ok) {
      return { ok: true }
    }

    const data = await response.json().catch(() => null)
    return {
      ok: false,
      error: (data && data.error) || 'Envoi impossible pour le moment.',
    }
  } catch {
    return { ok: false, error: 'Réseau indisponible. Réessayez plus tard.' }
  }
}
