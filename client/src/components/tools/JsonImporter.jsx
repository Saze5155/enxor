import { useState } from 'react';

export default function JsonImporter() {
    const [jsonContent, setJsonContent] = useState('');
    const [targetType, setTargetType] = useState('races');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleImport = async () => {
        if (!jsonContent.trim()) return;

        setLoading(true);
        setMessage(null);

        try {
            let parsedData;
            try {
                parsedData = JSON.parse(jsonContent);
            } catch (e) {
                setMessage({ type: 'error', text: 'Format JSON invalide.' });
                setLoading(false);
                return;
            }

            // Support both single object and array of objects
            const itemsToImport = Array.isArray(parsedData) ? parsedData : [parsedData];
            const endpoint = `http://localhost:3000/api/data/${targetType}`;

            let successCount = 0;
            let errors = 0;

            for (const item of itemsToImport) {
                try {
                    const response = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(item)
                    });

                    if (response.ok) successCount++;
                    else errors++;
                } catch (err) {
                    errors++;
                }
            }

            setMessage({
                type: errors === 0 ? 'success' : 'warning',
                text: `Import terminé: ${successCount} succès, ${errors} échecs.`
            });

            if (errors === 0) setJsonContent(''); // Clear on full success

        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Erreur inattendue.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-xl font-bold text-stone-200 border-b border-stone-600 pb-2">Import JSON</h2>

            {message && (
                <div className={`p-3 rounded ${message.type === 'success' ? 'bg-green-800 text-green-100' : 'bg-amber-800 text-amber-100'}`}>
                    {message.text}
                </div>
            )}

            <div>
                <label className="block text-sm font-bold text-stone-400 mb-2">Type de données</label>
                <div className="flex gap-4">
                    {['races', 'items', 'classes', 'spells', 'feats'].map(type => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer bg-stone-700/50 p-2 rounded hover:bg-stone-700">
                            <input
                                type="radio"
                                name="targetType"
                                value={type}
                                checked={targetType === type}
                                onChange={e => setTargetType(e.target.value)}
                                className="text-amber-500 focus:ring-amber-500"
                            />
                            <span className="capitalize text-stone-300">{type}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-stone-400 mb-1">Contenu JSON</label>
                <p className="text-xs text-stone-500 mb-2">Collez ici un objet JSON ou un tableau d'objets respectant la structure.</p>
                <textarea
                    value={jsonContent}
                    onChange={e => setJsonContent(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-600 rounded p-4 text-stone-300 font-mono text-xs focus:outline-none focus:border-amber-500 h-64"
                    placeholder={`[
  {
    "nom": "Exemple",
    ...
  }
]`}
                />
            </div>

            <div className="flex justify-end pt-4 border-t border-stone-700">
                <button
                    onClick={handleImport}
                    disabled={loading || !jsonContent}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded shadow-lg transform transition active:scale-95 disabled:opacity-50"
                >
                    {loading ? 'Importation...' : 'Importer'}
                </button>
            </div>
        </div>
    );
}
