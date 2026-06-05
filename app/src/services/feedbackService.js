const DEFAULT_FEEDBACK_URL = '/api/feedback'

function feedbackApiUrl() {
  const configured = process.env.VUE_APP_FEEDBACK_API_URL
  if (configured && String(configured).trim()) {
    return String(configured).trim()
  }
  const prefix = process.env.VUE_APP_PREFIX_PATH || ''
  const base = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix
  return `${base}${DEFAULT_FEEDBACK_URL}`
}

/**
 * @param {{
 *   raison: 'bug' | 'suggestion' | 'donnee_fausse',
 *   type: 'utilisateur' | 'operateur',
 *   commentaire: string,
 *   email?: string,
 *   id_indicateur?: string,
 *   libelle_indicateur?: string,
 *   url_page?: string,
 *   website?: string,
 * }} payload
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function submitFeedback(payload) {
  try {
    const response = await fetch(feedbackApiUrl(), {
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
