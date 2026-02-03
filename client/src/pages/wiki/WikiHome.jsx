import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import wikiService from '../../services/wikiService';
import { useAuth } from '../../context/AuthContext';
import VisibilityControl from '../../components/VisibilityControl';

export default function WikiHome() {
    const [categories, setCategories] = useState([]);
    const [articles, setArticles] = useState([]);
    const { user } = useAuth();

    // Quick MJ actions state
    const [newCatName, setNewCatName] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const cats = await wikiService.getCategories();
            const arts = await wikiService.getArticles();
            setCategories(cats);
            setArticles(arts);
        } catch (error) {
            console.error("Error loading wiki", error);
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCatName.trim()) return;
        await wikiService.createCategory({ name: newCatName, icon: '📂' }); // Default icon for now
        setNewCatName('');
        loadData();
    }

    const [selectedCategory, setSelectedCategory] = useState(null);

    // Filter articles based on selection
    const displayedArticles = selectedCategory
        ? articles.filter(a => a.categoryId === selectedCategory.id)
        : articles;

    const handleCategoryClick = (cat) => {
        setSelectedCategory(cat);
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-indigo-400">
                    {selectedCategory ? `Encyclopédie > ${selectedCategory.name}` : 'Encyclopédie'}
                </h1>
                <div className="flex gap-4">
                    {/* Debug info */}
                    <span className="text-xs bg-gray-700 px-2 py-1 rounded">Role: {user?.role || 'Guest'}</span>

                    <NavLink
                        to="/wiki/new"
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow transition"
                    >
                        + Nouvel Article
                    </NavLink>
                </div>
            </div>

            {/* Categories Grid (Show only if no category selected) */}
            {!selectedCategory && (
                <>
                    <h2 className="text-xl font-bold mb-4 text-gray-300">Catégories</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                        {categories.map((cat) => (
                            <div
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat)}
                                className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-indigo-500 transition cursor-pointer group"
                            >
                                <div className="text-3xl mb-2">{cat.icon || '📂'}</div>
                                <h3 className="font-bold text-lg group-hover:text-indigo-400">{cat.name}</h3>
                                <p className="text-sm text-gray-500">{cat.articles?.length || 0} articles</p>
                            </div>
                        ))}

                        {/* Add Category Card (Dev: Visible to all) */}
                        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 border-dashed flex flex-col justify-center">
                            <h3 className="font-bold text-gray-400 mb-2 text-sm">+ Nouvelle Catégorie</h3>
                            <form onSubmit={handleCreateCategory} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newCatName}
                                    onChange={(e) => setNewCatName(e.target.value)}
                                    placeholder="Nom..."
                                    className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm flex-1"
                                />
                                <button type="submit" className="bg-indigo-600 px-3 rounded text-sm">OK</button>
                            </form>
                        </div>
                    </div>
                </>
            )}

            {/* Articles List */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-300">
                    {selectedCategory ? `Articles dans "${selectedCategory.name}"` : 'Tous les Articles Récents'}
                </h2>
                {selectedCategory && (
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className="text-gray-400 hover:text-white underline text-sm"
                    >
                        ← Retour aux catégories
                    </button>
                )}
            </div>

            <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                {displayedArticles.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Aucun article dans cette section.</div>
                ) : (
                    <div className="divide-y divide-gray-700">
                        {displayedArticles.map((article) => (
                            <NavLink
                                key={article.id}
                                to={`/wiki/article/${article.id}`}
                                className="block p-4 hover:bg-gray-700 flex justify-between items-center transition"
                            >
                                <div>
                                    <h4 className="font-bold text-indigo-300">{article.title}</h4>
                                    <span className="text-xs text-gray-500 uppercase tracking-wider">{article.category?.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    {/* Visibility Badge for MJ */}
                                    {user?.role === 'MJ' ? (
                                        <VisibilityControl
                                            article={article}
                                            onUpdate={(updated) => {
                                                setArticles(prev => prev.map(a => a.id === updated.id ? updated : a));
                                            }}
                                        />
                                    ) : article.visibility === 'TARGETED' && (
                                        <span className="text-xs px-2 py-1 rounded border border-indigo-500 text-indigo-400">
                                            🎯 Ciblé
                                        </span>
                                    )}
                                    <span className="text-gray-500 text-sm">➔</span>
                                </div>
                            </NavLink>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
