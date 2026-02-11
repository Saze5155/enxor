export const STANDARD_ITEMS = [
    // Armes Courantes - Mêlée
    { name: "Bâton", type: "arme", weight: 1.8, value: 0.2, damage: "1d6 contondant", properties: "Polyvalente (1d8)" },
    { name: "Dague", type: "arme", weight: 0.5, value: 2, damage: "1d4 perforant", properties: "Finesse, légère, lancer (portée 6/18)" },
    { name: "Gourdin", type: "arme", weight: 1, value: 0.1, damage: "1d4 contondant", properties: "Légère" },
    { name: "Hachette", type: "arme", weight: 1, value: 5, damage: "1d6 tranchant", properties: "Légère, lancer (portée 6/18)" },
    { name: "Javelot", type: "arme", weight: 1, value: 0.5, damage: "1d6 perforant", properties: "Lancer (portée 9/36)" },
    { name: "Lance", type: "arme", weight: 1.5, value: 1, damage: "1d6 perforant", properties: "Lancer (portée 6/18), polyvalente (1d8)" },
    { name: "Marteau léger", type: "arme", weight: 1, value: 2, damage: "1d4 contondant", properties: "Légère, lancer (portée 6/18)" },
    { name: "Massue", type: "arme", weight: 5, value: 0.2, damage: "1d8 contondant", properties: "A deux mains" },
    { name: "Faucille", type: "arme", weight: 1, value: 1, damage: "1d4 tranchant", properties: "Légère" },

    // Armes Courantes - Distance
    { name: "Arbalète légère", type: "arme", weight: 2.5, value: 25, damage: "1d8 perforant", properties: "Munitions (portée 24/96), chargement, à deux mains" },
    { name: "Arc court", type: "arme", weight: 1, value: 25, damage: "1d6 perforant", properties: "Munitions (portée 24/96), à deux mains" },
    { name: "Fronde", type: "arme", weight: 0, value: 0.1, damage: "1d4 contondant", properties: "Munitions (portée 9/36)" },
    
    // Armes de Guerre - Mêlée
    { name: "Épée à deux mains", type: "arme", weight: 3, value: 50, damage: "2d6 tranchant", properties: "Lourde, à deux mains" },
    { name: "Épée courte", type: "arme", weight: 1, value: 10, damage: "1d6 perforant", properties: "Finesse, légère" },
    { name: "Épée longue", type: "arme", weight: 1.5, value: 15, damage: "1d8 tranchant", properties: "Polyvalente (1d10)" },
    { name: "Hache d'armes", type: "arme", weight: 2, value: 10, damage: "1d8 tranchant", properties: "Polyvalente (1d10)" },
    { name: "Grande hache", type: "arme", weight: 3.5, value: 30, damage: "1d12 tranchant", properties: "Lourde, à deux mains" },
    { name: "Cimeterre", type: "arme", weight: 1.5, value: 25, damage: "1d6 tranchant", properties: "Finesse, légère" },
    { name: "Rapière", type: "arme", weight: 1, value: 25, damage: "1d8 perforant", properties: "Finesse" },
    { name: "Marteau de guerre", type: "arme", weight: 1, value: 15, damage: "1d8 contondant", properties: "Polyvalente (1d10)" },
    { name: "Hallebarde", type: "arme", weight: 3, value: 20, damage: "1d10 tranchant", properties: "Lourde, allongée, à deux mains" },

    // Armes de Guerre - Distance
    { name: "Arbalète lourde", type: "arme", weight: 9, value: 50, damage: "1d10 perforant", properties: "Munitions (portée 30/120), lourde, chargement, à deux mains" },
    { name: "Arc long", type: "arme", weight: 1, value: 50, damage: "1d8 perforant", properties: "Munitions (portée 45/180), lourde, à deux mains" },
    { name: "Arbalète de poing", type: "arme", weight: 1.5, value: 75, damage: "1d6 perforant", properties: "Munitions (portée 9/36), légère, chargement" },

    // Armures Légères
    { name: "Matelassée", type: "armure", weight: 4, value: 5, damage: "11 + Dex", properties: "Désavantage Discrétion" },
    { name: "Cuir", type: "armure", weight: 5, value: 10, damage: "11 + Dex", properties: "" },
    { name: "Cuir clouté", type: "armure", weight: 6.5, value: 45, damage: "12 + Dex", properties: "" },

    // Armures Intermédiaires
    { name: "Peaux", type: "armure", weight: 6, value: 10, damage: "12 + Dex (max 2)", properties: "" },
    { name: "Chemise de mailles", type: "armure", weight: 10, value: 50, damage: "13 + Dex (max 2)", properties: "" },
    { name: "Écailles", type: "armure", weight: 22.5, value: 50, damage: "14 + Dex (max 2)", properties: "Désavantage Discrétion" },
    { name: "Cuirasse", type: "armure", weight: 10, value: 400, damage: "14 + Dex (max 2)", properties: "" },
    { name: "Demi-plate", type: "armure", weight: 20, value: 750, damage: "15 + Dex (max 2)", properties: "Désavantage Discrétion" },

    // Armures Lourdes
    { name: "Cotte de mailles", type: "armure", weight: 27.5, value: 75, damage: "16", properties: "Force 13, Désavantage Discrétion" },
    { name: "Clibanion", type: "armure", weight: 30, value: 200, damage: "17", properties: "Force 15, Désavantage Discrétion" },
    { name: "Harnois", type: "armure", weight: 32.5, value: 1500, damage: "18", properties: "Force 15, Désavantage Discrétion" },

    // Bouclier
    { name: "Bouclier", type: "bouclier", weight: 3, value: 10, damage: "+2", properties: "" },

    // Équipement d'Aventurier
    { name: "Sac à dos", type: "objet", weight: 2.5, value: 2, damage: "", properties: "" },
    { name: "Sac de couchage", type: "objet", weight: 3.5, value: 1, damage: "", properties: "" },
    { name: "Corde en chanvre (15m)", type: "objet", weight: 5, value: 1, damage: "", properties: "" },
    { name: "Torche", type: "objet", weight: 0.5, value: 0.01, damage: "", properties: "Ééclaire 6m/6m pendant 1h" },
    { name: "Rations (1 jour)", type: "consommable", weight: 1, value: 0.5, damage: "", properties: "" },
    { name: "Gourde", type: "objet", weight: 2.5, value: 0.2, damage: "", properties: "" },
    { name: "Kit de soins", type: "outil", weight: 1.5, value: 5, damage: "", properties: "10 utilisations" },
    { name: "Potion de soins", type: "consommable", weight: 0.5, value: 50, damage: "", properties: "Rend 2d4+2 PV" },

    // Outils
    { name: "Outils de voleur", type: "outil", weight: 0.5, value: 25, damage: "", properties: "" },
    { name: "Instrument de musique", type: "outil", weight: 1, value: 30, damage: "", properties: "" },
];
