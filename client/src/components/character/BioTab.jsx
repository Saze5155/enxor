import React from 'react';

export default function BioTab({ character }) {
    return (
        <div className="p-4 space-y-4 font-serif text-stone-800">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                    <div className="bg-white border border-stone-300 rounded p-3 shadow-sm rotate-1">
                        <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Traits de Personnalité</label>
                        <p className="text-xs italic">{character.traits || "Non défini..."}</p>
                    </div>
                    <div className="bg-white border border-stone-300 rounded p-3 shadow-sm -rotate-1">
                        <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Idéaux</label>
                        <p className="text-xs italic">{character.ideals || "Non défini..."}</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="bg-white border border-stone-300 rounded p-3 shadow-sm rotate-1">
                        <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Liens</label>
                        <p className="text-xs italic">{character.bonds || "Non défini..."}</p>
                    </div>
                    <div className="bg-white border border-stone-300 rounded p-3 shadow-sm -rotate-1">
                        <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Défauts</label>
                        <p className="text-xs italic">{character.flaws || "Non défini..."}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-stone-300 rounded p-4 shadow-sm relative mt-6">
                <div className="absolute -top-3 left-4 bg-stone-100 px-2 text-xs font-bold text-stone-600 uppercase tracking-widest border border-stone-300 rounded shadow-sm">
                    Histoire
                </div>
                <p className="text-sm leading-relaxed text-justify whitespace-pre-wrap">
                    {character.backstory || "Aucune histoire connue..."}
                </p>
            </div>
        </div>
    );
}
