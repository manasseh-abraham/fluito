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
  const [step, setStep] = useState(() => {
    if (!user?.first_name?.trim() || !user?.last_name?.trim()) return 0;
    if (!user?.date_of_birth) return 1;
    return 2;
  });

  if (profileComplete) {
    return <Navigate to="/discover" replace />;
  }

  const handleSubmit = async () => {
    setError('');

    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your first and last name');
      setStep(0);
      return;
    }
    if (!dateOfBirth || !gender) {
      setError('Date of birth and gender are required to continue');
      return;
    }
    if (!isAtLeast18(dateOfBirth)) {
      setError(UNDERAGE_MESSAGE);
      setStep(1);
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

  const nextFromName = () => {
    setError('');
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your first and last name');
      return;
    }
    setStep(1);
  };

  const nextFromDob = () => {
    setError('');
    if (!dateOfBirth) {
      setError('Date of birth is required');
      return;
    }
    if (!isAtLeast18(dateOfBirth)) {
      setError(UNDERAGE_MESSAGE);
      return;
    }
    setStep(2);
  };

  return (
    <div className="auth-screen">
      <div className="progress-track" aria-hidden>
        <div className={`progress-seg${step >= 0 ? ' on' : ''}`} />
        <div className={`progress-seg${step >= 1 ? ' on' : ''}`} />
        <div className={`progress-seg${step >= 2 ? ' on' : ''}`} />
      </div>

      {step === 0 && (
        <div className="onboard-step">
          <h2>What&apos;s your name?</h2>
          <p>This is how you&apos;ll appear on Fluito.</p>
          <div className="form-group">
            <input
              type="text"
              placeholder="First name"
              autoComplete="given-name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Last name"
              autoComplete="family-name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />
          </div>
          <button type="button" className="btn-primary" onClick={nextFromName}>
            Continue
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="onboard-step">
          <button type="button" className="screen-back" onClick={() => setStep(0)}>
            ← Back
          </button>
          <h2>Your birthday</h2>
          <p>You must be 18 or older. We use this to show your age, not your date of birth.</p>
          <div className="form-group">
            <input
              type="date"
              value={dateOfBirth}
              onChange={(event) => setDateOfBirth(event.target.value)}
              required
            />
          </div>
          <p className="helper-text">Must be 18+. Date of birth cannot be in the last 18 years.</p>
          <button type="button" className="btn-primary" onClick={nextFromDob}>
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="onboard-step">
          <button type="button" className="screen-back" onClick={() => setStep(1)}>
            ← Back
          </button>
          <h2>I am a</h2>
          <p>Fluito needs your gender before Discover.</p>
          <div className="choice-grid" role="group" aria-label="Gender">
            <button
              type="button"
              className={`choice${gender === 'male' ? ' selected' : ''}`}
              onClick={() => setGender('male')}
            >
              Male
            </button>
            <button
              type="button"
              className={`choice${gender === 'female' ? ' selected' : ''}`}
              onClick={() => setGender('female')}
            >
              Female
            </button>
          </div>
          <button type="button" className="btn-primary" disabled={loading || !gender} onClick={handleSubmit}>
            {loading ? 'Saving…' : 'Save and continue'}
          </button>
        </div>
      )}

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
  );
};

export default OnboardingPage;
