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

    const handleDelete = async (id) => {
        try {
            await characterService.delete(id);
            setCharacters(characters.filter(c => c.id !== id));
        } catch (error) {
            console.error("Failed to delete character", error);
            alert("Erreur lors de la suppression du personnage.");
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
                        <div key={char.id} className="relative group">
                            <NavLink
                                to={`/characters/${char.id}`}
                                className="block bg-stone-800 rounded-lg overflow-hidden border border-stone-700 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 transition group-hover:bg-stone-700"
                            >
                                <div className="h-32 bg-stone-900 flex items-center justify-center relative">
                                    {/* Placeholder for Avatar */}
                                    <span className="text-4xl">👤</span>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-xl font-bold text-stone-100 group-hover:text-indigo-400 font-serif">{char.name}</h3>
                                    <p className="text-sm text-stone-400 font-serif">{char.race} {char.class} (Lv.{char.level})</p>
                                    <div className="mt-4 flex justify-between text-xs text-stone-500">
                                        <span>HP: {char.hpCurrent}/{char.hpMax}</span>
                                        <span>Joueur: {char.user?.username}</span>
                                    </div>
                                </div>
                            </NavLink>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (window.confirm(`Voulez-vous vraiment supprimer ${char.name} ? Cette action est irréversible.`)) {
                                        handleDelete(char.id);
                                    }
                                }}
                                className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                                title="Supprimer le personnage"
                            >
                                🗑️
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
