import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
                    <h1 className="text-3xl font-bold">Dashboard {user?.role}</h1>
                    <div className="flex items-center gap-4">
                        <span>Bonjour, <span className="text-indigo-400 font-bold">{user?.username}</span></span>
                        <button
                            onClick={logout}
                            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm"
                        >
                            Déconnexion
                        </button>
                    </div>
                </header>

                <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                        <h2 className="text-xl font-bold mb-4">Campagnes</h2>
                        <p className="text-gray-400">Aucune campagne active.</p>
                        <button className="mt-4 bg-indigo-600/50 hover:bg-indigo-600 px-4 py-2 rounded w-full">
                            + Nouvelle Campagne
                        </button>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                        <h2 className="text-xl font-bold mb-4">Personnages</h2>
                        <p className="text-gray-400">0 personnages créés.</p>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                        <h2 className="text-xl font-bold mb-4">Encyclopédie</h2>
                        <p className="text-gray-400">Accéder au lore.</p>
                    </div>
                </main>
            </div>
        </div>
    );
}
