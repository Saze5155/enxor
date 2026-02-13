const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { generateNPCWithGroq } = require('../utils/groqClient');

// --- CRUD OPERATIONS ---

exports.getNPCs = async (req, res) => {
    try {
        const npcs = await prisma.NPC.findMany({
            orderBy: { name: 'asc' },
            include: { author: { select: { username: true } } }
        });
        res.json(npcs);
    } catch (error) {
        console.error("Get NPCs Error", error);
        res.status(500).json({ message: "Erreur récupération PNJ" });
    }
};

exports.getNPC = async (req, res) => {
    try {
        const { id } = req.params;
        const npc = await prisma.NPC.findUnique({
            where: { id },
            include: { author: { select: { username: true } } }
        });
        
        if (!npc) {
            return res.status(404).json({ message: "PNJ non trouvé" });
        }
        
        res.json(npc);
    } catch (error) {
        console.error("Get NPC Error", error);
        res.status(500).json({ message: "Erreur récupération PNJ" });
    }
};

exports.createNPC = async (req, res) => {
    try {
        const data = req.body;
        const authorId = req.user.userId;

        // Créer le PNJ
        const newNPC = await prisma.NPC.create({
            data: {
                ...data,
                authorId
            }
        });

        // Créer automatiquement un article Wiki si des informations existent
        if (data.background || data.personality || data.appearance) {
            try {
                // Déterminer la catégorie
                let categoryName = data.isImportant ? 'Personnages Importants' : 'PNJ';
                
                // Trouver ou créer la catégorie
                let category = await prisma.category.findFirst({
                    where: { name: categoryName }
                });

                if (!category) {
                    category = await prisma.category.create({
                        data: {
                            name: categoryName,
                            icon: categoryName === 'PNJ' ? '👤' : '⭐'
                        }
                    });
                }

                // Construire le contenu de l'article
                let articleContent = '';
                
                // En-tête
                articleContent += `**${data.role}** - ${data.race}`;
                if (data.class) {
                    articleContent += ` (${data.class} niveau ${data.level})`;
                }
                articleContent += `\n\n`;
                
                // Apparence
                if (data.appearance) {
                    articleContent += `## Apparence\n\n${data.appearance}\n\n`;
                }
                
                // Personnalité
                if (data.personality) {
                    articleContent += `## Personnalité\n\n${data.personality}\n\n`;
                }
                
                if (data.ideals) {
                    articleContent += `**Idéaux** : ${data.ideals}\n\n`;
                }
                
                if (data.bonds) {
                    articleContent += `**Liens** : ${data.bonds}\n\n`;
                }
                
                if (data.flaws) {
                    articleContent += `**Défauts** : ${data.flaws}\n\n`;
                }
                
                // Background
                if (data.background) {
                    articleContent += `## Histoire\n\n${data.background}\n\n`;
                }
                
                // Informations pratiques
                articleContent += `---\n\n**Informations**\n\n`;
                
                if (data.occupation) {
                    articleContent += `- **Occupation** : ${data.occupation}\n`;
                }
                
                if (data.location) {
                    articleContent += `- **Lieu** : ${data.location}\n`;
                }
                
                if (data.faction) {
                    articleContent += `- **Faction** : ${data.faction}\n`;
                }
                
                if (data.age) {
                    articleContent += `- **Âge** : ${data.age}\n`;
                }

                // Détails supplémentaires
                if (data.quirks) {
                    articleContent += `\n**Particularités** : ${data.quirks}\n`;
                }
                
                if (data.voice) {
                    articleContent += `**Façon de parler** : ${data.voice}\n`;
                }
                
                if (data.goals) {
                    articleContent += `\n**Objectifs** : ${data.goals}\n`;
                }

                // Créer l'article
                await prisma.article.create({
                    data: {
                        title: data.name,
                        content: articleContent,
                        visibility: 'PUBLIC',
                        categoryId: category.id
                    }
                });

                console.log(`[NPC] Article Wiki créé pour "${data.name}" dans la catégorie "${categoryName}"`);
            } catch (wikiError) {
                console.error('[NPC] Erreur création article Wiki:', wikiError);
                // Ne pas bloquer la création du PNJ
            }
        }

        res.status(201).json(newNPC);
    } catch (error) {
        console.error("Create NPC Error", error);
        res.status(500).json({ message: "Erreur création PNJ" });
    }
};

exports.updateNPC = async (req, res) => {
    try {
        const { id } = req.params;
        // Sanitiser les données : exclure les champs système et les relations
        const { id: _id, authorId, author, createdAt, updatedAt, ...updateData } = req.body;

        const updatedNPC = await prisma.NPC.update({
            where: { id },
            data: updateData
        });

        res.json(updatedNPC);
    } catch (error) {
        console.error("Update NPC Error", error);
        res.status(500).json({ message: "Erreur mise à jour PNJ" });
    }
};

exports.deleteNPC = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.NPC.delete({
            where: { id }
        });

        res.json({ message: "PNJ supprimé" });
    } catch (error) {
        console.error("Delete NPC Error", error);
        res.status(500).json({ message: "Erreur suppression PNJ" });
    }
};

// --- AI GENERATION ---

exports.generateWithAI = async (req, res) => {
    try {
        console.log('[NPC AI Generation] Request received');
        console.log('[NPC AI Generation] User:', req.user);
        console.log('[NPC AI Generation] Body:', req.body);

        const {
            concept,
            role,
            race,
            isImportant,
            context,
            location,
            traits,
            faction,
            generateStats,
            level,
            classType
        } = req.body;

        // Validation
        if (!concept || !role || !race) {
            return res.status(400).json({ 
                message: "Paramètres manquants (concept, role, race requis)" 
            });
        }

        // Construire le prompt pour Groq
        const prompt = `Tu es un expert en création de PNJ pour D&D 5e. Génère un PNJ cohérent et intéressant.

INFORMATIONS :
- Nom/Concept : ${concept}
- Rôle : ${role}
- Race : ${race}
- Niveau d'importance : ${isImportant ? 'PNJ majeur/récurrent' : 'PNJ mineur'}
${context ? `- Contexte : ${context}` : ''}
${location ? `- Lieu : ${location}` : ''}
${traits ? `- Traits souhaités : ${traits}` : ''}
${faction ? `- Faction : ${faction}` : ''}
${generateStats ? `- Classe : ${classType || 'Aucune'}, Niveau : ${level || 1}` : ''}

RETOURNE UNIQUEMENT un JSON valide (pas de markdown, pas de texte avant/après) avec cette structure EXACTE :
{
  "name": "Nom complet du PNJ",
  "role": "${role}",
  "race": "${race}",
  "class": ${generateStats ? `"${classType || 'Guerrier'}"` : 'null'},
  "level": ${generateStats ? (level || 1) : 1},
  "age": "Âge approximatif (ex: 'Milieu de la trentaine')",
  "appearance": "Description physique détaillée en 2-3 phrases",
  "personality": "3-4 traits de personnalité concrets",
  "ideals": "Idéaux/Motivations principales",
  "bonds": "Liens/Attachements importants",
  "flaws": "Défauts/Faiblesses",
  "background": "Histoire en 2-3 paragraphes",
  "occupation": "Métier/Fonction précise",
  "location": "${location || 'À définir'}",
  "faction": "${faction || 'Aucune'}",
  "quirks": "Particularités/Tics de langage ou comportement",
  "voice": "Façon de parler (ex: 'Voix grave, parle lentement')",
  "goals": "Objectifs actuels"${generateStats ? `,
  "stats": {
    "force": 10,
    "dexterite": 10,
    "constitution": 10,
    "intelligence": 10,
    "sagesse": 10,
    "charisme": 10,
    "ac": 10,
    "hp": 10
  }` : ''}
}

IMPORTANT : Retourne UNIQUEMENT le JSON, sans aucun texte avant ou après.`;

        // Appeler Groq
        const npcData = await generateNPCWithGroq(prompt);

        // Validation basique
        if (!npcData.name || !npcData.role) {
            return res.status(500).json({ 
                message: "L'IA a généré un PNJ incomplet. Réessayez." 
            });
        }

        // Convertir stats en JSON string si présent
        if (npcData.stats && typeof npcData.stats === 'object') {
            npcData.stats = JSON.stringify(npcData.stats);
        }

        // Retourner le PNJ (pas encore sauvegardé)
        res.json({ 
            npc: npcData,
            message: "PNJ généré avec succès. Vous pouvez le modifier avant de sauvegarder."
        });

    } catch (error) {
        console.error("Generate NPC with AI Error", error);
        res.status(500).json({ 
            message: error.message || "Erreur lors de la génération IA",
            suggestion: "Vérifiez votre clé API Groq ou réessayez."
        });
    }
};
