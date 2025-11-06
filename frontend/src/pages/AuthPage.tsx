import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regData, setRegData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '' as 'male' | 'female' | '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(loginEmail, loginPassword);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!regData.email || !regData.password || !regData.first_name || 
        !regData.last_name || !regData.date_of_birth || !regData.gender) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (regData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      await register(regData);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 
        (err.response?.data?.details?.map((d: any) => d.message).join(', ')) ||
        'Registration failed';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', minHeight: '100vh' }}>
      <div className="glass-card auth-card" style={{ maxWidth: '450px', width: '100%', margin: 'auto' }}>
        <div className="logo">Fluito</div>
        <div className="subtitle">Find your God-fearing partner</div>

        {isLogin ? (
          <div>
            <h2 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '28px', fontWeight: 600 }}>
              Welcome Back
            </h2>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)' }}>
              Don't have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(false); setError(''); }} style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 600 }}>
                Sign Up
              </a>
            </p>
          </div>
        ) : (
          <div>
            <h2 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '28px', fontWeight: 600 }}>
              Create Account
            </h2>
            <form onSubmit={handleRegister}>
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={regData.first_name}
                    onChange={(e) => setRegData({ ...regData, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={regData.last_name}
                    onChange={(e) => setRegData({ ...regData, last_name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Password (min 8 characters)"
                  value={regData.password}
                  onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                  required
                  minLength={8}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="date"
                    value={regData.date_of_birth}
                    onChange={(e) => setRegData({ ...regData, date_of_birth: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <select
                    value={regData.gender}
                    onChange={(e) => setRegData({ ...regData, gender: e.target.value as 'male' | 'female' })}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(true); setError(''); }} style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 600 }}>
                Sign In
              </a>
            </p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default AuthPage;

