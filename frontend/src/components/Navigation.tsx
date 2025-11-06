import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <nav className="glass-nav">
      <div className="nav-logo">Fluito</div>
      <div className="nav-links">
        <Link to="/discover" className={`nav-link ${isActive('/discover') ? 'active' : ''}`}>
          <span className="nav-icon">🔍</span>
          <span>Discover</span>
        </Link>
        <Link to="/matches" className={`nav-link ${isActive('/matches') ? 'active' : ''}`}>
          <span className="nav-icon">💑</span>
          <span>Matches</span>
        </Link>
        <Link to="/messages" className={`nav-link ${isActive('/messages') ? 'active' : ''}`}>
          <span className="nav-icon">💬</span>
          <span>Messages</span>
        </Link>
        <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
          <span className="nav-icon">👤</span>
          <span>Profile</span>
        </Link>
      </div>
      <button className="btn-logout" onClick={handleLogout}>Logout</button>
    </nav>
  );
};

export default Navigation;

