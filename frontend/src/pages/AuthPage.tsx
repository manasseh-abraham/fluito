import { useState } from 'react';
import GoogleSignInButton from '../components/GoogleSignInButton';
import LegalLinks from '../components/LegalLinks';
import { useAuth } from '../context/AuthContext';
import { isAtLeast18, UNDERAGE_MESSAGE } from '../utils/age';
import { getApiError } from '../utils/errors';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regData, setRegData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '' as 'male' | 'female' | '',
  });

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(loginEmail, loginPassword);
    } catch (err) {
      setError(getApiError(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    if (
      !regData.email ||
      !regData.password ||
      !regData.first_name ||
      !regData.last_name ||
      !regData.date_of_birth ||
      !regData.gender
    ) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (regData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    if (!isAtLeast18(regData.date_of_birth)) {
      setError(UNDERAGE_MESSAGE);
      setLoading(false);
      return;
    }

    try {
      await register({
        email: regData.email,
        password: regData.password,
        first_name: regData.first_name,
        last_name: regData.last_name,
        date_of_birth: regData.date_of_birth,
        gender: regData.gender,
      });
    } catch (err) {
      setError(getApiError(err, 'Registration failed'));
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
                  onChange={(event) => setLoginEmail(event.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            <div className="auth-divider">
              <span>or</span>
            </div>
            <GoogleSignInButton
              disabled={loading}
              onStart={() => {
                setError('');
                setLoading(true);
              }}
              onError={(message) => {
                setError(message);
                setLoading(false);
              }}
            />
            <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)' }}>
              Don't have an account?{' '}
              <a
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  setIsLogin(false);
                  setError('');
                }}
                style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 600 }}
              >
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
                    onChange={(event) => setRegData({ ...regData, first_name: event.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={regData.last_name}
                    onChange={(event) => setRegData({ ...regData, last_name: event.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={regData.email}
                  onChange={(event) => setRegData({ ...regData, email: event.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Password (min 8 characters)"
                  value={regData.password}
                  onChange={(event) => setRegData({ ...regData, password: event.target.value })}
                  required
                  minLength={8}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="date"
                    value={regData.date_of_birth}
                    onChange={(event) => setRegData({ ...regData, date_of_birth: event.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <select
                    value={regData.gender}
                    onChange={(event) => setRegData({ ...regData, gender: event.target.value as 'male' | 'female' })}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
              <p className="helper-text">Must be 18+. Date of birth cannot be in the last 18 years.</p>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
            <div className="auth-divider">
              <span>or</span>
            </div>
            <GoogleSignInButton
              disabled={loading}
              onStart={() => {
                setError('');
                setLoading(true);
              }}
              onError={(message) => {
                setError(message);
                setLoading(false);
              }}
            />
            <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <a
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  setIsLogin(true);
                  setError('');
                }}
                style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 600 }}
              >
                Sign In
              </a>
            </p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
        <LegalLinks />
      </div>
    </div>
  );
};

export default AuthPage;
