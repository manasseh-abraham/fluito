import { useState } from 'react';
import GoogleSignInButton from '../components/GoogleSignInButton';
import LegalLinks from '../components/LegalLinks';
import { useAuth } from '../context/AuthContext';
import { isAtLeast18, UNDERAGE_MESSAGE } from '../utils/age';
import { getApiError } from '../utils/errors';

const SPLASH_FACES = [
  { src: 'https://randomuser.me/api/portraits/women/44.jpg', style: { width: 92, height: 92, left: 94, top: 78 } },
  { src: 'https://randomuser.me/api/portraits/men/32.jpg', style: { width: 72, height: 72, left: 18, top: 36 } },
  { src: 'https://randomuser.me/api/portraits/women/68.jpg', style: { width: 64, height: 64, left: 196, top: 24 } },
  { src: 'https://randomuser.me/api/portraits/men/75.jpg', style: { width: 58, height: 58, left: 8, top: 140 } },
  { src: 'https://randomuser.me/api/portraits/women/21.jpg', style: { width: 78, height: 78, left: 198, top: 118 } },
  { src: 'https://randomuser.me/api/portraits/men/11.jpg', style: { width: 52, height: 52, left: 62, top: 208 } },
  { src: 'https://randomuser.me/api/portraits/women/65.jpg', style: { width: 56, height: 56, left: 158, top: 204 } },
];

type View = 'landing' | 'login' | 'register';

const AuthPage = () => {
  const [view, setView] = useState<View>('landing');
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

  const go = (next: View) => {
    setView(next);
    setError('');
  };

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

  if (view === 'landing') {
    return (
      <div className="auth-screen auth-screen--center">
        <div className="splash-cluster" aria-hidden>
          {SPLASH_FACES.map((face) => (
            <img key={face.src} className="splash-face" src={face.src} alt="" style={face.style} />
          ))}
        </div>
        <div className="wordmark">Fluito</div>
        <p className="tagline">Find your God-fearing partner</p>
        <button type="button" className="btn-primary" onClick={() => go('login')}>
          Sign in
        </button>
        <button type="button" className="btn-ghost" onClick={() => go('register')}>
          Create account
        </button>
        <LegalLinks />
      </div>
    );
  }

  return (
    <div className="auth-screen">
      <button type="button" className="screen-back" onClick={() => go('landing')}>
        ← Back
      </button>

      {view === 'login' ? (
        <>
          <h1 className="auth-heading">Welcome back</h1>
          <p className="auth-sub">Sign in to keep swiping.</p>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                autoComplete="email"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
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
          <p className="switch-auth">
            Don&apos;t have an account?{' '}
            <button type="button" onClick={() => go('register')}>
              Sign up
            </button>
          </p>
        </>
      ) : (
        <>
          <h1 className="auth-heading">Create account</h1>
          <p className="auth-sub">Must be 18+. Fluito is for Christian Pentecostal dating.</p>
          <form onSubmit={handleRegister}>
            <div className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="First name"
                  autoComplete="given-name"
                  value={regData.first_name}
                  onChange={(event) => setRegData({ ...regData, first_name: event.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Last name"
                  autoComplete="family-name"
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
                autoComplete="email"
                value={regData.email}
                onChange={(event) => setRegData({ ...regData, email: event.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Password (min 8 characters)"
                autoComplete="new-password"
                value={regData.password}
                onChange={(event) => setRegData({ ...regData, password: event.target.value })}
                required
                minLength={8}
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-dob">Birthday</label>
              <input
                id="reg-dob"
                type="date"
                value={regData.date_of_birth}
                onChange={(event) => setRegData({ ...regData, date_of_birth: event.target.value })}
                required
              />
            </div>
            <p className="helper-text">Must be 18+. Date of birth cannot be in the last 18 years.</p>
            <div className="choice-grid" role="group" aria-label="Gender">
              <button
                type="button"
                className={`choice${regData.gender === 'male' ? ' selected' : ''}`}
                onClick={() => setRegData({ ...regData, gender: 'male' })}
              >
                Male
              </button>
              <button
                type="button"
                className={`choice${regData.gender === 'female' ? ' selected' : ''}`}
                onClick={() => setRegData({ ...regData, gender: 'female' })}
              >
                Female
              </button>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
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
          <p className="switch-auth">
            Already have an account?{' '}
            <button type="button" onClick={() => go('login')}>
              Sign in
            </button>
          </p>
        </>
      )}

      {error && <div className="error-message">{error}</div>}
      <LegalLinks />
    </div>
  );
};

export default AuthPage;
