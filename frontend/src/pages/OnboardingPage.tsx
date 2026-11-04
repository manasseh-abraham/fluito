import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import LegalLinks from '../components/LegalLinks';
import { useAuth } from '../context/AuthContext';
import { isAtLeast18, UNDERAGE_MESSAGE } from '../utils/age';
import { getApiError } from '../utils/errors';

const OnboardingPage = () => {
  const { user, profileComplete, completeOnboarding, logout } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.date_of_birth || '');
  const [gender, setGender] = useState<'male' | 'female' | ''>(
    user?.gender === 'male' || user?.gender === 'female' ? user.gender : ''
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (profileComplete) {
    return <Navigate to="/discover" replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your first and last name');
      return;
    }
    if (!dateOfBirth || !gender) {
      setError('Date of birth and gender are required to continue');
      return;
    }
    if (!isAtLeast18(dateOfBirth)) {
      setError(UNDERAGE_MESSAGE);
      return;
    }

    setLoading(true);
    try {
      await completeOnboarding({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        date_of_birth: dateOfBirth,
        gender,
      });
      navigate('/discover', { replace: true });
    } catch (err) {
      setError(getApiError(err, 'Could not save your profile'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', minHeight: '100vh' }}>
      <div className="glass-card auth-card" style={{ maxWidth: '450px', width: '100%', margin: 'auto' }}>
        <div className="logo">Fluito</div>
        <h2 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '28px', fontWeight: 600 }}>
          Complete your profile
        </h2>
        <p className="subtitle" style={{ marginBottom: '24px' }}>
          Fluito needs your date of birth and gender before Discover. You must be 18 or older.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <input
                type="date"
                value={dateOfBirth}
                onChange={(event) => setDateOfBirth(event.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <select
                value={gender}
                onChange={(event) => setGender(event.target.value as 'male' | 'female')}
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
            {loading ? 'Saving…' : 'Save and continue'}
          </button>
        </form>
        <button
          type="button"
          className="btn-text"
          disabled={loading}
          onClick={() => {
            logout();
            navigate('/', { replace: true });
          }}
        >
          Log out
        </button>
        {error && <div className="error-message">{error}</div>}
        <LegalLinks />
      </div>
    </div>
  );
};

export default OnboardingPage;
