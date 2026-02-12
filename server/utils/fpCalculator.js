// FP Calculator - D&D 5e Challenge Rating
// Based on DMG p.274-279

// XP Budget par niveau et difficulté (DMG Table)
const XP_BUDGET_PAR_JOUEUR = {
  1: { facile: 25, moyenne: 50, difficile: 75, mortelle: 100 },
  2: { facile: 50, moyenne: 100, difficile: 150, mortelle: 200 },
  3: { facile: 75, moyenne: 150, difficile: 225, mortelle: 400 },
  4: { facile: 125, moyenne: 250, difficile: 375, mortelle: 500 },
  5: { facile: 250, moyenne: 500, difficile: 750, mortelle: 1100 },
  6: { facile: 300, moyenne: 600, difficile: 900, mortelle: 1400 },
  7: { facile: 350, moyenne: 750, difficile: 1100, mortelle: 1700 },
  8: { facile: 450, moyenne: 900, difficile: 1400, mortelle: 2100 },
  9: { facile: 550, moyenne: 1100, difficile: 1600, mortelle: 2400 },
  10: { facile: 600, moyenne: 1200, difficile: 1900, mortelle: 2800 },
  11: { facile: 800, moyenne: 1600, difficile: 2400, mortelle: 3600 },
  12: { facile: 1000, moyenne: 2000, difficile: 3000, mortelle: 4500 },
  13: { facile: 1100, moyenne: 2200, difficile: 3400, mortelle: 5100 },
  14: { facile: 1250, moyenne: 2500, difficile: 3800, mortelle: 5700 },
  15: { facile: 1400, moyenne: 2800, difficile: 4300, mortelle: 6400 },
  16: { facile: 1600, moyenne: 3200, difficile: 4800, mortelle: 7200 },
  17: { facile: 2000, moyenne: 3900, difficile: 5900, mortelle: 8800 },
  18: { facile: 2100, moyenne: 4200, difficile: 6300, mortelle: 9500 },
  19: { facile: 2400, moyenne: 4900, difficile: 7300, mortelle: 10900 },
  20: { facile: 2800, moyenne: 5700, difficile: 8500, mortelle: 12700 }
};

// Conversion XP → FP (DMG p.275)
const FP_PAR_XP = [
  { xp: 0, fp: 0 },
  { xp: 10, fp: 0 },
  { xp: 25, fp: 0.125 },
  { xp: 50, fp: 0.25 },
  { xp: 100, fp: 0.5 },
  { xp: 200, fp: 1 },
  { xp: 450, fp: 2 },
  { xp: 700, fp: 3 },
  { xp: 1100, fp: 4 },
  { xp: 1800, fp: 5 },
  { xp: 2300, fp: 6 },
  { xp: 2900, fp: 7 },
  { xp: 3900, fp: 8 },
  { xp: 5000, fp: 9 },
  { xp: 5900, fp: 10 },
  { xp: 7200, fp: 11 },
  { xp: 8400, fp: 12 },
  { xp: 10000, fp: 13 },
  { xp: 11500, fp: 14 },
  { xp: 13000, fp: 15 },
  { xp: 15000, fp: 16 },
  { xp: 18000, fp: 17 },
  { xp: 20000, fp: 18 },
  { xp: 22000, fp: 19 },
  { xp: 25000, fp: 20 },
  { xp: 33000, fp: 21 },
  { xp: 41000, fp: 22 },
  { xp: 50000, fp: 23 },
  { xp: 62000, fp: 24 },
  { xp: 75000, fp: 25 },
  { xp: 90000, fp: 26 },
  { xp: 105000, fp: 27 },
  { xp: 120000, fp: 28 },
  { xp: 135000, fp: 29 },
  { xp: 155000, fp: 30 }
];

/**
 * Calcule le FP suggéré pour un ennemi selon le niveau du groupe
 * @param {Object} params
 * @param {number} params.niveauGroupe - Niveau moyen du groupe (1-20)
 * @param {number} params.nombreJoueurs - Nombre de joueurs (1-8)
 * @param {string} params.difficulte - 'facile', 'moyenne', 'difficile', 'mortelle'
 * @returns {number} FP suggéré
 */
function calculerFPSuggere({ niveauGroupe, nombreJoueurs, difficulte }) {
  // Validation
  if (niveauGroupe < 1 || niveauGroupe > 20) {
    throw new Error('Niveau du groupe doit être entre 1 et 20');
  }
  if (nombreJoueurs < 1 || nombreJoueurs > 8) {
    throw new Error('Nombre de joueurs doit être entre 1 et 8');
  }
  if (!['facile', 'moyenne', 'difficile', 'mortelle'].includes(difficulte)) {
    throw new Error('Difficulté invalide');
  }

  // Calcul du budget XP total
  const xpParJoueur = XP_BUDGET_PAR_JOUEUR[niveauGroupe][difficulte];
  const xpTotal = xpParJoueur * nombreJoueurs;

  // Trouver le FP correspondant
  let fpSuggere = 0;
  for (let i = FP_PAR_XP.length - 1; i >= 0; i--) {
    if (xpTotal >= FP_PAR_XP[i].xp) {
      fpSuggere = FP_PAR_XP[i].fp;
      break;
    }
  }

  return fpSuggere;
}

/**
 * Retourne l'XP pour un FP donné
 * @param {number} fp - Challenge Rating
 * @returns {number} XP correspondant
 */
function getXPParFP(fp) {
  const entry = FP_PAR_XP.find(e => e.fp === fp);
  return entry ? entry.xp : 0;
}

module.exports = {
  calculerFPSuggere,
  getXPParFP,
  XP_BUDGET_PAR_JOUEUR,
  FP_PAR_XP
};
