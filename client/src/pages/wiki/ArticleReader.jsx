import { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import wikiService from '../../services/wikiService';
import DOMPurify from 'dompurify';
import { useAuth } from '../../context/AuthContext';
import VisibilityControl from '../../components/VisibilityControl';

export default function ArticleReader() {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        loadArticle();
    }, [id]);

    const loadArticle = async () => {
        try {
            const data = await wikiService.getArticle(id);
            setArticle(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-gray-400">Chargement...</div>;
    if (!article) return <div className="p-8 text-red-400">Article introuvable.</div>;

    const sanitizedContent = DOMPurify.sanitize(article.content);

    return (
        <div className="p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8 border-b border-gray-700 pb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="text-sm text-indigo-400 uppercase tracking-widest font-bold mb-2 block">
                            {article.category?.icon} {article.category?.name}
                        </span>
                        <h1 className="text-4xl font-extrabold text-white mb-2">{article.title}</h1>
                        {user?.role === 'MJ' && (
                            <div className="mt-2 text-left">
                                <VisibilityControl
                                    article={article}
                                    onUpdate={(updated) => setArticle({ ...article, ...updated })}
                                />
                            </div>
                        )}
                    </div>
                    {user?.role === 'MJ' && (
                        <NavLink
                            to={`/wiki/edit/${article.id}`}
                            className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-gray-300"
                        >
                            Modifier
                        </NavLink>
                    )}
                </div>

                {/* Tags */}
                <div className="flex gap-2 mt-4">
                    {article.tags?.map(tag => (
                        <span key={tag.id} className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded-full border border-gray-700">
                            #{tag.name}
                        </span>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div
                className="prose prose-invert prose-indigo max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
        </div>
    );
}
