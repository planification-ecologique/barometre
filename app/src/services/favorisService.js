/**
 * Service de gestion des graphiques favoris via localStorage.
 * Stocke les identifiants des indicateurs sauvegardés (label_indic).
 */

const STORAGE_KEY = 'sgpe-favoris';

/**
 * Récupère la liste des identifiants d'indicateurs sauvegardés.
 * @returns {string[]}
 */
export function getFavoris() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Erreur lecture favoris:', e);
    return [];
  }
}

/**
 * Vérifie si un indicateur est dans les favoris.
 * @param {string} labelIndic - Le label_indic de l'indicateur
 * @returns {boolean}
 */
export function isFavori(labelIndic) {
  return getFavoris().includes(labelIndic);
}

/**
 * Ajoute un indicateur aux favoris.
 * @param {string} labelIndic - Le label_indic de l'indicateur
 */
export function ajouterFavori(labelIndic) {
  const favoris = getFavoris();
  if (!favoris.includes(labelIndic)) {
    favoris.push(labelIndic);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favoris));
  }
}

/**
 * Retire un indicateur des favoris.
 * @param {string} labelIndic - Le label_indic de l'indicateur
 */
export function retirerFavori(labelIndic) {
  const favoris = getFavoris().filter(id => id !== labelIndic);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favoris));
}

/**
 * Bascule l'état favori d'un indicateur.
 * @param {string} labelIndic - Le label_indic de l'indicateur
 * @returns {boolean} - Le nouvel état (true = favori, false = retiré)
 */
export function toggleFavori(labelIndic) {
  if (isFavori(labelIndic)) {
    retirerFavori(labelIndic);
    return false;
  } else {
    ajouterFavori(labelIndic);
    return true;
  }
}

/**
 * Retourne le nombre de favoris sauvegardés.
 * @returns {number}
 */
export function getNbFavoris() {
  return getFavoris().length;
}
