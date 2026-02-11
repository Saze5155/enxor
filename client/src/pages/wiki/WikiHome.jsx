import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import wikiService from '../../services/wikiService';
import { useAuth } from '../../context/AuthContext';
import VisibilityControl from '../../components/VisibilityControl';
// Removed Heroicons import

export default function WikiHome() {
    const [categories, setCategories] = useState([]);
    const [articles, setArticles] = useState([]);
    const { user } = useAuth();

    // Quick MJ actions state
    const [newCatName, setNewCatName] = useState('');

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('alpha'); // 'alpha', 'recent'
    const [selectedCategory, setSelectedCategory] = useState(null);

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
        await wikiService.createCategory({ name: newCatName, icon: 'folder' }); // Use Material 'folder'
        setNewCatName('');
        loadData();
    }

    // Helper to render Emoji or Material Icon
    const renderIcon = (icon) => {
        const iconStr = icon || 'folder';
        // Heuristic: M-Icons are words (length > 2), Emojis are usually short
        if (iconStr.length > 2 && /^[a-z0-9_]+$/.test(iconStr)) {
            return <span className="material-symbols-outlined align-middle">{iconStr}</span>;
        }
        return <span className="text-xl align-middle">{iconStr}</span>;
    };

    // Filter Logic
    const filteredArticles = articles.filter(article => {
        const matchesCategory = selectedCategory ? article.categoryId === selectedCategory.id : true;
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (article.tags && article.tags.some(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())));
        return matchesCategory && matchesSearch;
    });

    // Sort Logic
    const sortedArticles = [...filteredArticles].sort((a, b) => {
        if (sortOrder === 'recent') {
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        }
        return a.title.localeCompare(b.title);
    });

    return (
        <div className="p-8 min-h-screen bg-stone-900 text-stone-200 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-amber-500 font-serif tracking-wider">Encyclopédie</h1>
                    <p className="text-stone-400 text-sm mt-1">Le savoir du monde à portée de main.</p>
                </div>

                <div className="flex gap-4">
                    {user?.role === 'MJ' && (
                        <NavLink
                            to="/wiki/new"
                            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded shadow transition flex items-center gap-2 font-bold"
                        >
                            <span>+</span> Nouvel Article
                        </NavLink>
                    )}
                </div>
            </div>

            {/* Search & Toolbar */}
            <div className="bg-stone-800 p-4 rounded-lg shadow-lg border border-stone-700 mb-8 flex flex-col md:flex-row gap-4 items-center">
                {/* Search Input */}
                <div className="relative flex-1 w-full">
                    <input
                        type="text"
                        placeholder="Rechercher un article, un tag..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-600 rounded-full py-2 pl-10 pr-4 text-stone-200 focus:outline-none focus:border-amber-500 transition"
                    />
                    <span className="material-symbols-outlined w-5 h-5 text-stone-500 absolute left-3 top-2.5 pointer-events-none">search</span>
                </div>

                {/* Sort Select */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="material-symbols-outlined w-5 h-5 text-stone-500">filter_list</span>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="bg-stone-900 border border-stone-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                    >
                        <option value="alpha">A-Z</option>
                        <option value="recent">Plus Récents</option>
                    </select>
                </div>
            </div>

            {/* Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Sidebar: Categories */}
                <div className="lg:col-span-1 space-y-4">
                    <h2 className="font-bold text-lg text-amber-500 border-b border-stone-700 pb-2 hidden lg:block">Catégories</h2>
                    <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`text-left px-4 py-2 rounded transition flex justify-between items-center shadow-md ${!selectedCategory ? 'bg-amber-700 text-white ring-2 ring-amber-500' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}
                        >
                            <span className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-xl">public</span>
                                <span className="font-medium hidden lg:inline">Toutes</span>
                            </span>
                            <span className="text-xs bg-stone-900 px-2 py-0.5 rounded opacity-70 hidden lg:inline">{articles.length}</span>
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat)}
                                className={`text-left px-4 py-2 rounded transition flex justify-between items-center shadow-md group ${selectedCategory?.id === cat.id ? 'bg-amber-700 text-white ring-2 ring-amber-500' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}
                            >
                                <span className="flex items-center gap-2">
                                    {renderIcon(cat.icon)}
                                    <span className="font-medium hidden lg:inline">{cat.name}</span>
                                </span>
                                <span className="text-xs bg-stone-900 px-2 py-0.5 rounded opacity-50 group-hover:opacity-100 transition hidden lg:inline">{cat.articles?.length || 0}</span>
                            </button>
                        ))}
                    </div>

                    {/* Quick Add Category (Dev/MJ) */}
                    {user?.role === 'MJ' && (
                        <div className="pt-4 border-t border-stone-700 mt-4 hidden lg:block">
                            <form onSubmit={handleCreateCategory} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newCatName}
                                    onChange={(e) => setNewCatName(e.target.value)}
                                    placeholder="Nouvelle..."
                                    className="bg-stone-900 border border-stone-600 rounded px-2 py-1 text-xs flex-1 text-white w-full"
                                />
                                <button type="submit" className="bg-stone-700 hover:bg-stone-600 px-2 rounded text-xs text-white">+</button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Main Content: Articles Grid */}
                <div className="lg:col-span-3">
                    <div className="mb-4 text-stone-400 text-sm flex justify-between items-center">
                        <span>{sortedArticles.length} article(s) trouvé(s)</span>
                        {selectedCategory && <span className="text-amber-500 font-bold">Filtre : {selectedCategory.name}</span>}
                    </div>

                    {sortedArticles.length === 0 ? (
                        <div className="text-center py-20 bg-stone-800 rounded border border-dashed border-stone-700">
                            <p className="text-stone-500 text-lg">Aucun article ne correspond à votre recherche.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {sortedArticles.map(article => (
                                <NavLink
                                    key={article.id}
                                    to={`/wiki/article/${article.id}`}
                                    className="bg-stone-800 rounded-lg border border-stone-700 overflow-hidden hover:border-amber-500 transition shadow-lg group flex flex-col"
                                >
                                    {/* Card Header with Category Label */}
                                    <div className="h-8 bg-gradient-to-r from-amber-900 to-stone-800 flex items-center px-3 justify-between border-b border-stone-700">
                                        <span className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1">
                                            {renderIcon(article.category?.icon)} {article.category?.name}
                                        </span>

                                        {/* Visibility Badges in Header */}
                                        {user?.role === 'MJ' ? (
                                            <div onClick={(e) => e.preventDefault()}> {/* Prevent nav link click */}
                                                <VisibilityControl
                                                    article={article}
                                                    onUpdate={(updated) => setArticles(prev => prev.map(a => a.id === updated.id ? updated : a))}
                                                />
                                            </div>
                                        ) : article.visibility === 'TARGETED' && (
                                            <span className="material-symbols-outlined text-indigo-400 text-sm opacity-80" title="Ciblé">gps_fixed</span>
                                        )}
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="text-xl font-bold text-stone-200 group-hover:text-amber-400 transition mb-2">
                                            {article.title}
                                        </h3>

                                        {/* Tags */}
                                        {article.tags && article.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-auto pt-4">
                                                {article.tags.map(tag => (
                                                    <span key={tag.id} className="text-[10px] bg-stone-900 text-stone-400 px-2 py-1 rounded-full">
                                                        #{tag.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="text-[10px] text-stone-600 mt-2 text-right">
                                            Mis à jour le {new Date(article.updatedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </NavLink>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
