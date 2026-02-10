import React from 'react';

export default function FeaturesTab({ character }) {
    const features = character.features || [];

    return (
        <div className="p-4 space-y-4">
            <div className="bg-white border border-stone-300 rounded p-4 shadow-sm">
                <h3 className="font-bold text-stone-700 border-b border-stone-300 pb-1 mb-2 uppercase text-xs">Traits de Classe & Raciaux</h3>
                {features.length > 0 ? (
                    <ul className="space-y-4">
                        {features.map((feat, i) => (
                            <li key={i}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="font-bold text-stone-800 text-sm">{feat.name}</span>
                                    <span className="text-[10px] text-stone-400 uppercase">{feat.source}</span>
                                </div>
                                <p className="text-xs text-stone-600 leading-relaxed text-justify">
                                    {feat.description}
                                </p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-xs text-stone-400 italic">Aucun trait particulier.</p>
                )}
            </div>
        </div>
    );
}
