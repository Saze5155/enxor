// Groq API Client
// Documentation: https://console.groq.com/docs/quickstart

/**
 * Appelle l'API Groq pour générer du contenu structuré
 * @param {string} systemPrompt - Instructions système
 * @param {string} userPrompt - Prompt utilisateur
 * @param {Object} options - Options additionnelles
 * @returns {Promise<string>} Réponse de l'IA
 */
async function callGroq(systemPrompt, userPrompt, options = {}) {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error('GROQ_API_KEY non définie dans .env');
  }

  const {
    model = 'llama-3.3-70b-versatile',
    temperature = 0.7,
    maxTokens = 2000
  } = options;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature,
        max_tokens: maxTokens
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Groq API Error: ${error.error?.message || 'Erreur inconnue'}`);
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('Aucune réponse de Groq');
    }

    return data.choices[0].message.content;

  } catch (error) {
    console.error('Groq API Error:', error);
    throw error;
  }
}

/**
 * Génère un ennemi D&D 5e via Groq
 * @param {Object} params - Paramètres de génération
 * @returns {Promise<Object>} Statblock JSON
 */
async function genererEnnemiAvecGroq(params) {
  const {
    concept,
    type,
    taille,
    fpSuggere,
    role,
    portee,
    capacitesTexte,
    capacitesPredefinies,
    habitat,
    comportement,
    genererLore,
    estBoss
  } = params;

  const systemPrompt = `Tu es un expert en création de créatures D&D 5e. Tu génères UNIQUEMENT du JSON valide, sans texte avant ou après. Tu respectes strictement les règles d'équilibrage du DMG (Dungeon Master's Guide).

RÈGLES STRICTES :
1. Le JSON doit être parsable directement
2. Les stats doivent correspondre EXACTEMENT au FP demandé (utilise DMG p.274-279)
3. Les dégâts, CA, PV doivent être cohérents avec le FP
4. Pas de markdown, pas de commentaires, UNIQUEMENT du JSON`;

  const userPrompt = `Génère un ennemi D&D 5e avec les contraintes suivantes :

CONTRAINTES STRICTES :
- Facteur de Puissance (FP) : ${fpSuggere}
- ${estBoss ? 'C\'EST UN BOSS : ajoute +20% PV, actions légendaires, résistances' : 'Créature standard'}

INFORMATIONS :
- Nom/Concept : ${concept}
- Type : ${type}
- Taille : ${taille}
- Rôle : ${role}
- Portée : ${portee}

${capacitesTexte ? `CAPACITÉS DEMANDÉES :\n${capacitesTexte}` : ''}

${capacitesPredefinies && capacitesPredefinies.length > 0 ? `CAPACITÉS PRÉDÉFINIES :\n${capacitesPredefinies.join(', ')}` : ''}

${habitat ? `HABITAT : ${habitat}` : ''}
${comportement ? `COMPORTEMENT : ${comportement}` : ''}

IMPORTANT :
1. Respecte STRICTEMENT le FP ${fpSuggere} (utilise la table du DMG p. 274-279)
2. Les stats doivent être équilibrées pour ce FP
3. Calcule précisément : CA, PV, bonus attaque, dégâts selon le FP
4. Les capacités doivent correspondre au concept sans être overpowered

RETOURNE UNIQUEMENT un JSON valide avec cette structure EXACTE :
{
  "name": "Nom de la créature",
  "creatureType": "${type}",
  "subType": "sous-type si applicable",
  "size": "${taille}",
  "alignment": "alignement",
  "stats": {
    "ca": 15,
    "pv_formule": "8d10+16",
    "pv_moyenne": 60,
    "vitesse_marche": "9m",
    "vitesse_vol": "0m",
    "vitesse_nage": "0m",
    "force": 16,
    "dexterite": 14,
    "constitution": 14,
    "intelligence": 10,
    "sagesse": 12,
    "charisme": 10,
    "jets_sauvegarde": "Dex +4, Con +4",
    "competences": "Perception +3",
    "immunites_degats": "",
    "resistances_degats": "",
    "vulnerabilites_degats": "",
    "immunites_etats": "",
    "sens": "vision dans le noir 18m, Perception passive 13",
    "langues": "Commun",
    "facteur_puissance": ${fpSuggere},
    "xp": ${getXPForFP(fpSuggere)}
  },
  "actions": [
    {
      "nom": "Attaque Multiple",
      "description": "Description complète de l'action"
    }
  ],
  "capacites_speciales": [
    {
      "nom": "Capacité Spéciale",
      "description": "Description"
    }
  ],
  ${genererLore ? `"lore": {
    "description_courte": "Description en 1-2 phrases",
    "description_longue": "Description détaillée (2-3 paragraphes)",
    "habitat": "Où vit cette créature",
    "comportement": "Comment elle se comporte",
    "tactiques": "Comment elle combat"
  }` : '"lore": null'}
}`;

  const response = await callGroq(systemPrompt, userPrompt, {
    temperature: 0.7,
    maxTokens: 2500
  });

  // Parser le JSON
  try {
    // Nettoyer la réponse (enlever les backticks si présents)
    const cleanJson = response.replace(/```json\n?|\n?```/g, '').trim();
    const statblock = JSON.parse(cleanJson);
    return statblock;
  } catch (error) {
    console.error('Erreur parsing JSON:', error);
    console.error('Réponse brute:', response);
    throw new Error('L\'IA a retourné un format invalide. Réessayez.');
  }
}

/**
 * Retourne l'XP pour un FP donné (helper)
 */
function getXPForFP(fp) {
  const { getXPParFP } = require('./fpCalculator');
  return getXPParFP(fp);
}

/**
 * Génère un PNJ via Groq
 * @param {string} prompt - Prompt complet pour la génération
 * @returns {Promise<Object>} Données du PNJ en JSON
 */
async function generateNPCWithGroq(prompt) {
  const systemPrompt = `Tu es un expert en création de PNJ pour D&D 5e. Tu génères UNIQUEMENT du JSON valide, sans texte avant ou après.

RÈGLES STRICTES :
1. Le JSON doit être parsable directement
2. Les personnalités doivent être cohérentes et intéressantes
3. Les backgrounds doivent être détaillés et crédibles
4. Pas de markdown, pas de commentaires, UNIQUEMENT du JSON`;

  const response = await callGroq(systemPrompt, prompt, {
    temperature: 0.8, // Plus de créativité pour les PNJ
    maxTokens: 2000
  });

  // Parser le JSON
  try {
    // Nettoyer la réponse (enlever les backticks si présents)
    const cleanJson = response.replace(/```json\n?|\n?```/g, '').trim();
    const npcData = JSON.parse(cleanJson);
    return npcData;
  } catch (error) {
    console.error('Erreur parsing JSON:', error);
    console.error('Réponse brute:', response);
    throw new Error('L\'IA a retourné un format invalide. Réessayez.');
  }
}

module.exports = {
  callGroq,
  genererEnnemiAvecGroq,
  generateNPCWithGroq
};
