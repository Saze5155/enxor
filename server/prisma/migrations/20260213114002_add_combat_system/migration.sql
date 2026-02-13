-- CreateTable
CREATE TABLE "Combat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL,
    "dateDebut" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateFin" DATETIME,
    "statut" TEXT NOT NULL,
    "roundActuel" INTEGER NOT NULL DEFAULT 1,
    "tourActuelIndex" INTEGER NOT NULL DEFAULT 0,
    "ordreInitiative" TEXT NOT NULL DEFAULT '[]',
    "parametres" TEXT NOT NULL DEFAULT '{}',
    "historiqueActions" TEXT NOT NULL DEFAULT '[]',
    "statistiques" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Combat_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CombatParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "combatId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "characterId" TEXT,
    "enemyInstanceId" TEXT,
    "initiative" INTEGER NOT NULL,
    "pvActuels" INTEGER NOT NULL,
    "pvMax" INTEGER NOT NULL,
    "pvTemporaires" INTEGER NOT NULL DEFAULT 0,
    "ca" INTEGER NOT NULL,
    "conditions" TEXT NOT NULL DEFAULT '[]',
    "effetsTemporaires" TEXT NOT NULL DEFAULT '[]',
    "position" TEXT,
    "estConscient" BOOLEAN NOT NULL DEFAULT true,
    "mort" BOOLEAN NOT NULL DEFAULT false,
    "concentreSur" TEXT,
    "degatsInfliges" INTEGER NOT NULL DEFAULT 0,
    "degatsRecus" INTEGER NOT NULL DEFAULT 0,
    "soinsProdigues" INTEGER NOT NULL DEFAULT 0,
    "sortsLances" INTEGER NOT NULL DEFAULT 0,
    "jetsCritiques" INTEGER NOT NULL DEFAULT 0,
    "jetsEchecsCritiques" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CombatParticipant_combatId_fkey" FOREIGN KEY ("combatId") REFERENCES "Combat" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CombatParticipant_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CombatParticipant_enemyInstanceId_fkey" FOREIGN KEY ("enemyInstanceId") REFERENCES "EnemyInstance" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Combat_campaignId_idx" ON "Combat"("campaignId");

-- CreateIndex
CREATE INDEX "Combat_statut_idx" ON "Combat"("statut");

-- CreateIndex
CREATE INDEX "CombatParticipant_combatId_idx" ON "CombatParticipant"("combatId");

-- CreateIndex
CREATE INDEX "CombatParticipant_characterId_idx" ON "CombatParticipant"("characterId");

-- CreateIndex
CREATE INDEX "CombatParticipant_enemyInstanceId_idx" ON "CombatParticipant"("enemyInstanceId");
