import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Background from './components/Background';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import DiscoverPage from './pages/DiscoverPage';
import MatchesPage from './pages/MatchesPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import './index.css';

const AppRoutes = () => {
  const { user, profileComplete } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={profileComplete ? '/discover' : '/onboarding'} replace />
          ) : (
            <AuthPage />
          )
        }
      />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute requireComplete={false}>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/discover"
        element={
          <ProtectedRoute>
            <Navigation />
            <DiscoverPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/matches"
        element={
          <ProtectedRoute>
            <Navigation />
            <MatchesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <Navigation />
            <MessagesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Navigation />
            <ProfilePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Background />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
