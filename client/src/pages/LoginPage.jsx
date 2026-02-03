import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ username: '', password: '' });
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isLogin) {
            const res = await login(formData.username, formData.password);
            if (res.success) {
                navigate('/dashboard');
            } else {
                setError(res.message);
            }
        } else {
            // Register logic
            const res = await register(formData.username, formData.password, 'MJ'); // Default to MJ for first user for now
            if (res.success) {
                setIsLogin(true);
                setError('Compte créé ! Connectez-vous.');
                setFormData({ username: '', password: '' });
            } else {
                setError(res.message);
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-96 border border-gray-700">
                <h1 className="text-3xl font-bold mb-6 text-center text-indigo-500">
                    {isLogin ? 'Connexion JDR' : 'Inscription MJ'}
                </h1>

                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-100 p-2 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nom d'utilisateur</label>
                        <input
                            type="text"
                            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-indigo-500"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Mot de passe</label>
                        <input
                            type="password"
                            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-indigo-500"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                    >
                        {isLogin ? 'Se connecter' : 'Créer un compte'}
                    </button>
                </form>

                <div className="mt-4 text-center text-sm">
                    <button
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        className="text-gray-400 hover:text-white underline"
                    >
                        {isLogin ? 'Pas de compte ? Créer un compte MJ' : 'Déjà un compte ? Se connecter'}
                    </button>
                </div>
            </div>
        </div>
    );
}
