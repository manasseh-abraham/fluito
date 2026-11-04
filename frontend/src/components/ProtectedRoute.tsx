import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({
  children,
  requireComplete = true,
}: {
  children: React.ReactNode;
  requireComplete?: boolean;
}) => {
  const { user, loading, profileComplete } = useAuth();

  if (loading) {
    return (
      <div className="centered-state" style={{ minHeight: '100%' }}>
        <div className="loader"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requireComplete && !profileComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
