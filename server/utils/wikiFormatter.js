
const formatRace = (race) => {
    const traitsHtml = race.traits.map(t => `<li class="mb-1"><span class="text-amber-400 font-bold">➤</span> ${t}</li>`).join('');
    
    return `
    <div class="bg-stone-800 border border-stone-600 rounded-lg overflow-hidden shadow-xl mb-6">
        <div class="bg-stone-900 p-4 border-b border-stone-600 flex justify-between items-center">
            <h2 class="text-2xl font-cinzel text-amber-500 font-bold m-0">${race.nom}</h2>
            <span class="bg-stone-700 text-stone-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Race</span>
        </div>
        <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div class="bg-stone-900/50 p-4 rounded border border-stone-700">
                    <h3 class="text-indigo-400 font-bold uppercase text-sm mb-2 border-b border-stone-700 pb-1">Caractéristiques</h3>
                    <div class="grid grid-cols-2 gap-2 text-sm">
                        <div class="text-stone-400">Vitesse</div>
                        <div class="text-stone-200 font-bold text-right">${race.vitesse} m</div>
                        <div class="text-stone-400">Taille</div>
                        <div class="text-stone-200 font-bold text-right">Moyenne</div>
                    </div>
                </div>
                <div class="bg-stone-900/50 p-4 rounded border border-stone-700">
                    <h3 class="text-indigo-400 font-bold uppercase text-sm mb-2 border-b border-stone-700 pb-1">Bonus de Stats</h3>
                    <div class="flex flex-wrap gap-2">
                        ${Object.entries(race.bonus_caracteristiques || {}).map(([stat, bonus]) => 
                            `<span class="bg-indigo-900/50 text-indigo-200 px-2 py-1 rounded text-xs border border-indigo-700 font-bold uppercase">${stat} +${bonus}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>

            <div class="mb-6">
                <h3 class="text-xl font-bold text-stone-300 mb-3 border-l-4 border-amber-500 pl-3">Description</h3>
                <div class="text-stone-400 leading-relaxed italic">
                    ${race.description}
                </div>
            </div>

            <div>
                <h3 class="text-xl font-bold text-stone-300 mb-3 border-l-4 border-amber-500 pl-3">Traits Raciaux</h3>
                <ul class="list-none pl-0 space-y-2 text-stone-300">
                    ${traitsHtml}
                </ul>
            </div>
        </div>
    </div>
    `;
};

const formatItem = (item) => {
    return `
    <div class="bg-stone-800 border border-stone-600 rounded-lg overflow-hidden shadow-xl mb-6 max-w-2xl mx-auto">
        <div class="bg-stone-900 p-4 border-b border-stone-600 flex justify-between items-center">
            <h2 class="text-2xl font-cinzel text-amber-500 font-bold m-0">${item.name}</h2>
            <span class="bg-stone-700 text-stone-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">${item.type}</span>
        </div>
        <div class="p-6">
            <div class="grid grid-cols-3 gap-4 mb-6 text-center">
                <div class="bg-stone-900/50 p-3 rounded border border-stone-700">
                    <div class="text-xs text-stone-500 uppercase font-bold mb-1">Valeur</div>
                    <div class="text-amber-400 font-bold text-lg">${item.value} po</div>
                </div>
                <div class="bg-stone-900/50 p-3 rounded border border-stone-700">
                    <div class="text-xs text-stone-500 uppercase font-bold mb-1">Poids</div>
                    <div class="text-stone-300 font-bold text-lg">${item.weight} kg</div>
                </div>
                <div class="bg-stone-900/50 p-3 rounded border border-stone-700">
                    <div class="text-xs text-stone-500 uppercase font-bold mb-1">Rareté</div>
                    <div class="text-stone-300 font-bold text-lg">Commune</div>
                </div>
            </div>

            ${item.damage ? `
            <div class="bg-red-900/20 border border-red-900/50 p-4 rounded mb-6 flex items-center justify-between">
                <span class="text-red-400 font-bold uppercase text-sm">Dégâts</span>
                <span class="text-red-200 font-bold text-xl font-mono">${item.damage}</span>
            </div>` : ''}

            ${item.armorClass ? `
            <div class="bg-blue-900/20 border border-blue-900/50 p-4 rounded mb-6 flex items-center justify-between">
                <span class="text-blue-400 font-bold uppercase text-sm">Classe d'Armure (CA)</span>
                <span class="text-blue-200 font-bold text-xl font-mono">${item.armorClass}</span>
            </div>` : ''}

            <div class="mb-4">
                 <h3 class="text-lg font-bold text-stone-300 mb-2">Propriétés</h3>
                 <p class="text-stone-400">${item.properties || 'Aucune propriété spéciale.'}</p>
            </div>
        </div>
    </div>
    `;
};

const formatClass = (cls) => {
    return `
    <div class="bg-stone-800 border border-stone-600 rounded-lg overflow-hidden shadow-xl mb-6">
        <div class="bg-stone-900 p-6 border-b border-stone-600 text-center">
            <h1 class="text-4xl font-cinzel text-amber-500 font-bold mb-2">${cls.nom}</h1>
            <div class="flex justify-center gap-4 text-sm text-stone-400">
                <span class="bg-stone-800 px-3 py-1 rounded-full border border-stone-700">Dé de Vie: 1${cls.de_vie}</span>
                <span class="bg-stone-800 px-3 py-1 rounded-full border border-stone-700">Caractéristique Principale: Force/Dextérité</span>
            </div>
        </div>
        
        <div class="p-6">
            <div class="bg-stone-900/50 p-6 rounded-lg border border-stone-700 mb-8">
                <h3 class="text-xl font-bold text-indigo-400 mb-4 flex items-center gap-2">
                    <span>🛡️</span> Maîtrises
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 class="text-xs text-stone-500 uppercase font-bold mb-2">Armures & Armes</h4>
                        <ul class="text-sm text-stone-300 space-y-1">
                            ${cls.maitrises?.armures?.map(a => `<li>• ${a}</li>`).join('') || '<li>Aucune</li>'}
                            ${cls.maitrises?.armes?.map(a => `<li>• ${a}</li>`).join('') || '<li>Aucune</li>'}
                        </ul>
                    </div>
                    <div>
                        <h4 class="text-xs text-stone-500 uppercase font-bold mb-2">Outils & Sauvegardes</h4>
                        <ul class="text-sm text-stone-300 space-y-1">
                             <li>Outils: ${cls.maitrises?.outils?.join(', ') || 'Aucun'}</li>
                             <li>Jets de Sauvegarde: ${cls.maitrises?.jets_de_sauvegarde?.join(', ') || 'Aucun'}</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="mb-8">
                <h3 class="text-xl font-bold text-stone-200 mb-4 border-b border-stone-700 pb-2">Équipement de Départ</h3>
                <div class="space-y-4">
                     ${cls.equipement_depart?.choix?.map((c, i) => `
                        <div class="bg-stone-700/30 p-3 rounded">
                            <span class="text-amber-500 font-bold mr-2">Choix ${i+1}: </span>
                            <span class="text-stone-300">${c.description}</span>
                        </div>
                     `).join('') || '<p class="text-stone-500">Aucun expert.</p>'}
                </div>
            </div>
        </div>
    </div>
    `;
};

const formatSpell = (spell) => {
    return `
    <div class="bg-stone-800 border border-purple-900/50 rounded-lg overflow-hidden shadow-xl mb-6 max-w-3xl mx-auto">
        <div class="bg-purple-900/20 p-4 border-b border-purple-900/50 flex justify-between items-start">
            <div>
                <h2 class="text-3xl font-cinzel text-purple-300 font-bold m-0">${spell.nom}</h2>
                <div class="text-purple-400 text-sm italic mt-1">${spell.ecole} de niveau ${spell.niveau}</div>
            </div>
            <div class="text-right">
                ${spell.classes?.map(c => `<span class="block text-xs text-stone-500 uppercase tracking-widest">${c}</span>`).join('')}
            </div>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-px bg-stone-700 border-b border-stone-700 text-center text-sm">
            <div class="bg-stone-800 p-3">
                <div class="text-xs text-stone-500 uppercase font-bold mb-1">Durée</div>
                <div class="text-stone-200 font-bold">${spell.duree}</div>
            </div>
            <div class="bg-stone-800 p-3">
                <div class="text-xs text-stone-500 uppercase font-bold mb-1">Portée</div>
                <div class="text-stone-200 font-bold">${spell.portee}</div>
            </div>
            <div class="bg-stone-800 p-3">
                <div class="text-xs text-stone-500 uppercase font-bold mb-1">Incantation</div>
                <div class="text-stone-200 font-bold">${spell.temps_incantation}</div>
            </div>
            <div class="bg-stone-800 p-3">
                <div class="text-xs text-stone-500 uppercase font-bold mb-1">Composantes</div>
                <div class="text-stone-200 font-bold">${spell.composantes}</div>
            </div>
        </div>

        <div class="p-6 text-stone-300 leading-relaxed space-y-4 text-justify">
            <p>${spell.description}</p>
            
            ${spell.aux_niveaux_superieurs ? `
            <div class="mt-4 bg-purple-900/10 p-4 rounded border-l-4 border-purple-500">
                <h4 class="text-purple-400 font-bold text-sm uppercase mb-1">Aux niveaux supérieurs</h4>
                <p class="text-sm text-stone-400 italic">${spell.aux_niveaux_superieurs}</p>
            </div>` : ''}
        </div>
    </div>
    `;
};

const formatFeat = (feat) => {
    return `
    <div class="bg-stone-800 border-l-4 border-amber-600 rounded-r-lg shadow-lg mb-6 p-6">
        <h2 class="text-2xl font-bold text-amber-500 mb-1 flex items-center gap-2">
            <span>🏅</span> ${feat.nom}
        </h2>
        <div class="text-sm text-stone-500 italic mb-4">Prérequis: ${feat.prerequis || 'Aucun'}</div>
        
        <p class="text-stone-300 mb-6 italic border-l-2 border-stone-600 pl-4 py-2">
            ${feat.description}
        </p>
        
        <div class="space-y-2">
            ${feat.effets.map(e => `
                <div class="flex items-start gap-3">
                    <span class="text-amber-600 text-lg leading-none mt-1">•</span>
                    <span class="text-stone-200">${e}</span>
                </div>
            `).join('')}
        </div>
    </div>
    `;
};

module.exports = { formatRace, formatItem, formatClass, formatSpell, formatFeat };
