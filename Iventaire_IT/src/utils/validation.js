/**
 * Centralized Input Control and Validation Utilities
 */

/**
 * Restricts input based on allowed types and length constraints using recursion.
 * @param {string} input - The input string to sanitize.
 * @param {string} allowedType - 'letters', 'numbers', 'alphanumeric', or 'phone'.
 * @param {number} maxLength - Maximum length allowed.
 * @param {number} currentIndex - For recursion state.
 * @param {string} result - Accumulated valid characters.
 * @returns {string} Sanitized string.
 */
export const restrictInput = (input, allowedType, maxLength, currentIndex = 0, result = '') => {
  if (!input) return '';
  if (currentIndex >= input.length || result.length >= maxLength) {
    return result;
  }

  const currentChar = input[currentIndex];

  let isValidChar = false;
  switch (allowedType) {
    case 'letters':
      // Allows letters, spaces, hyphens, and common French accented characters
      isValidChar = /^[a-zA-Z\sàâäéèêëîïôöùûüçÂÀÆŒÇÉÈÊËÎÏÔÖÙÛÜ]$/.test(currentChar);
      break;
    case 'numbers':
      isValidChar = /^[0-9]$/.test(currentChar);
      break;
    case 'alphanumeric':
      isValidChar = /^[a-zA-Z0-9\sàâäéèêëîïôöùûüçÂÀÆŒÇÉÈÊËÎÏÔÖÙÛÜ]$/.test(currentChar);
      break;
    case 'phone':
      isValidChar = /^[0-9\s\-\+]$/.test(currentChar);
      break;
    default:
      isValidChar = false;
  }

  const newResult = isValidChar ? result + currentChar : result;
  return restrictInput(input, allowedType, maxLength, currentIndex + 1, newResult);
};

/**
 * Validates form fields (détenteur/personnel and matériel details)
 * @param {Object} formData 
 * @returns {string|null} Error message or null if valid.
 */
export const validateMaterielForm = (formData) => {
  if (formData.attribue) {
    if (!formData.nom_det || !formData.nom_det.trim()) {
      return "Le nom du détenteur est requis.";
    }
    if (!formData.prenom_det || !formData.prenom_det.trim()) {
      return "Le prénom du détenteur est requis.";
    }
  }
  if (!formData.numero_serie || !formData.numero_serie.trim()) {
    return "Le numéro de série est obligatoire.";
  }
  if (!formData.nom_equi || !formData.nom_equi.trim()) {
    return "Le nom de l'équipement est obligatoire.";
  }
  if (!formData.marque || !formData.marque.trim()) {
    return "La marque de l'équipement est obligatoire.";
  }
  if (!formData.id_categorie) {
    return "Veuillez sélectionner une catégorie.";
  }
  return null;
};
