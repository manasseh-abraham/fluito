import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import TabBar from './components/TabBar';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import DiscoverPage from './pages/DiscoverPage';
import MatchesPage from './pages/MatchesPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import './index.css';

const MainShell = ({
  children,
  flush = false,
}: {
  children: React.ReactNode;
  flush?: boolean;
}) => (
  <>
    <main className={flush ? 'app-main app-main--flush' : 'app-main'}>{children}</main>
    <TabBar />
  </>
);

const AppRoutes = () => {
  const { user, profileComplete, loading } = useAuth();

  if (loading) {
    return (
      <div className="centered-state">
        <div className="loader" />
      </div>
    );
  }

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
            <MainShell flush>
              <DiscoverPage />
            </MainShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/matches"
        element={
          <ProtectedRoute>
            <MainShell>
              <MatchesPage />
            </MainShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <MainShell flush>
              <MessagesPage />
            </MainShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainShell>
              <ProfilePage />
            </MainShell>
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
        <div className="app-root">
          <div className="app-frame">
            <AppRoutes />
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
