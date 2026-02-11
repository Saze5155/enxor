import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/CampaignDashboard';
import MainLayout from './components/MainLayout';
import WikiHome from './pages/wiki/WikiHome';
import ArticleEditor from './pages/wiki/ArticleEditor';
import ArticleReader from './pages/wiki/ArticleReader';
import CharactersList from './pages/characters/CharactersList';
import CharacterCreator from './pages/characters/CharacterCreator';
import CharacterSheet from './pages/characters/CharacterSheet';
import MJTools from './pages/tools/MJTools';
import GameSession from './pages/session/GameSession';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route element={
        <PrivateRoute>
          <MainLayout />
        </PrivateRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Wiki Routes */}
        <Route path="/wiki" element={<WikiHome />} />
        <Route path="/wiki/new" element={<ArticleEditor />} />
        <Route path="/wiki/edit/:id" element={<ArticleEditor />} />
        <Route path="/wiki/article/:id" element={<ArticleReader />} />

        {/* Characters Routes */}
        <Route path="/characters" element={<CharactersList />} />
        <Route path="/characters/new" element={<CharacterCreator />} />
        <Route path="/characters/:id" element={<CharacterSheet />} />

        {/* Campaign Routes handled by Dashboard */}

        <Route path="/character" element={<Navigate to="/characters" replace />} />
        <Route path="/mj-tools" element={<MJTools />} />
      </Route>

      {/* Session Route (Standalone) */}
      <Route element={
        <PrivateRoute>
          <div className="h-screen w-screen overflow-hidden bg-black">
            <GameSession />
          </div>
        </PrivateRoute>
      }>
        <Route path="/campaign/:id/session" element={<GameSession />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
