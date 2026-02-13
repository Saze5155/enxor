#!/bin/bash
# Script de restauration assistée Time Machine

echo "🔄 Restauration de la base de données depuis Time Machine"
echo ""
echo "📍 Fichier à restaurer : /Users/phototendance/Documents/jdr/server/prisma/dev.db"
echo "📅 Date cible : 11 février 2026 à 18:48"
echo ""
echo "Ouverture de Time Machine..."

# Ouvrir Time Machine sur le dossier cible
open "tmutil:///Users/phototendance/Documents/jdr/server/prisma"

echo ""
echo "✅ Time Machine devrait s'ouvrir dans quelques secondes"
echo ""
echo "📋 INSTRUCTIONS :"
echo "1. Dans Time Machine, navigue jusqu'au 11 février 2026 à 18:48"
echo "2. Sélectionne le fichier 'dev.db'"
echo "3. Clique sur 'Restaurer'"
echo "4. Confirme le remplacement du fichier actuel"
echo "5. Reviens ici et appuie sur Entrée quand c'est fait"
echo ""
read -p "Appuie sur Entrée quand la restauration est terminée..."

echo ""
echo "✅ Vérification du fichier restauré..."
ls -lh /Users/phototendance/Documents/jdr/server/prisma/dev.db

echo ""
echo "🔍 Comptage des données..."
sqlite3 /Users/phototendance/Documents/jdr/server/prisma/dev.db "SELECT COUNT(*) as users FROM User; SELECT COUNT(*) as articles FROM Article;"

echo ""
echo "✅ Restauration terminée ! Retourne à Antigravity."
