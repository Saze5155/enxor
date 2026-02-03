import { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useNavigate, useParams } from 'react-router-dom';
import wikiService from '../../services/wikiService';

export default function ArticleEditor() {
    const navigate = useNavigate();
    const { id } = useParams(); // Get Article ID if editing
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        categoryId: '',
        visibility: 'DRAFT'
    });

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const cats = await wikiService.getCategories();
            setCategories(cats);

            if (id) {
                // Edit Mode: Load existing article
                const article = await wikiService.getArticle(id);
                setFormData({
                    title: article.title,
                    content: article.content,
                    categoryId: article.categoryId,
                    visibility: article.visibility
                });
            } else if (cats.length > 0) {
                // Create Mode: Default to first category
                setFormData(prev => ({ ...prev, categoryId: cats[0].id }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!formData.categoryId) {
                alert("Veuillez créer une catégorie d'abord !");
                return;
            }

            if (id) {
                await wikiService.updateArticle(id, formData);
            } else {
                await wikiService.createArticle(formData);
            }
            navigate('/wiki');
        } catch (error) {
            alert("Erreur lors de la sauvegarde.");
            console.error(error);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-indigo-400">
                {id ? 'Modifier Article' : 'Nouvel Article'}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title & Visibility */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold mb-2">Titre</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:border-indigo-500 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2">Visibilité</label>
                        <select
                            value={formData.visibility}
                            onChange={(e) => handleChange('visibility', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:border-indigo-500 outline-none"
                        >
                            <option value="DRAFT">🔒 Brouillon (Moi seul)</option>
                            <option value="PUBLIC">🌍 Public (Tout le monde)</option>
                            <option value="PARTIAL">👁️ Partiel</option>
                            <option value="SECRET">🕵️ Secret</option>
                        </select>
                    </div>
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-bold mb-2">Catégorie</label>
                    <select
                        value={formData.categoryId}
                        onChange={(e) => handleChange('categoryId', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:border-indigo-500 outline-none"
                    >
                        {categories.length === 0 && <option value="">Aucune catégorie (Créer en premier)</option>}
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                        ))}
                    </select>
                </div>

                {/* Editor */}
                <div className="bg-white text-black rounded">
                    <ReactQuill
                        theme="snow"
                        value={formData.content}
                        onChange={(v) => handleChange('content', v)}
                        className="h-64 mb-12"
                    />
                </div>

                <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-gray-700">
                    <button
                        type="button"
                        onClick={() => navigate('/wiki')}
                        className="px-4 py-2 text-gray-400 hover:text-white"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded font-bold"
                    >
                        Sauvegarder l'Article
                    </button>
                </div>
            </form>
        </div>
    );
}
