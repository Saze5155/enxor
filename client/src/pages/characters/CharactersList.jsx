import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import characterService from '../../services/characterService';

export default function CharactersList() {
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await characterService.getAll();
            setCharacters(data);
        } catch (error) {
            console.error("Failed to load characters", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-indigo-400">Personnages</h1>
                <NavLink
                    to="/characters/new"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow transition"
                >
                    + Créer un Personnage
                </NavLink>
            </div>

            {loading ? (
                <div className="text-gray-400 text-center py-10">Chargement...</div>
            ) : characters.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-gray-700 rounded-lg">
                    <p className="text-gray-400 mb-4">Vous n'avez pas encore de personnage.</p>
                    <NavLink to="/characters/new" className="text-indigo-400 hover:text-white underline">Commencer l'aventure</NavLink>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {characters.map(char => (
                        <NavLink
                            key={char.id}
                            to={`/characters/${char.id}`}
                            className="block bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 transition group"
                        >
                            <div className="h-32 bg-gray-900 flex items-center justify-center">
                                {/* Placeholder for Avatar */}
                                <span className="text-4xl">👤</span>
                            </div>
                            <div className="p-4">
                                <h3 className="text-xl font-bold text-white group-hover:text-indigo-400">{char.name}</h3>
                                <p className="text-sm text-gray-400">{char.race} {char.class} (Lv.{char.level})</p>
                                <div className="mt-4 flex justify-between text-xs text-gray-500">
                                    <span>HP: {char.hpCurrent}/{char.hpMax}</span>
                                    <span>Joueur: {char.user?.username}</span>
                                </div>
                            </div>
                        </NavLink>
                    ))}
                </div>
            )}
        </div>
    );
}
