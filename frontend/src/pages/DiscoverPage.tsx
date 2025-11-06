import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchesAPI } from '../services/api';
import type { Match } from '../services/api';
import { useToast } from '../hooks/useToast';

const DiscoverPage = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();

  const loadDiscover = async () => {
    try {
      setLoading(true);
      const response = await matchesAPI.discover();
      setMatches(response.data.matches);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiscover();
  }, []);

  const handleSwipe = async (userId: number, action: 'like' | 'reject') => {
    try {
      const response = await matchesAPI.swipe(userId, action);
      if (response.data.matched) {
        showToast('🎉 It\'s a match!', 'success');
        setTimeout(() => {
          navigate('/matches');
        }, 2000);
      } else {
        showToast(action === 'like' ? 'Like sent!' : 'Passed', 'info');
      }
      loadDiscover();
    } catch (error) {
      console.error('Error swiping:', error);
      showToast('Error processing swipe', 'error');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Discover Matches</h1>
          <button className="btn-icon" onClick={loadDiscover}>🔄</button>
        </div>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div className="loader"></div>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Discover Matches</h1>
          <button className="btn-icon" onClick={loadDiscover}>🔄</button>
        </div>
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No more matches available. Check back later!</p>
        </div>
      </div>
    );
  }

  const match = matches[0];
  const emoji = match.gender === 'female' ? '👩' : '👨';

  return (
    <div className="page-container">
      <ToastContainer />
      <div className="page-header">
        <h1>Discover Matches</h1>
        <button className="btn-icon" onClick={loadDiscover} title="Refresh">🔄</button>
      </div>
      <div className="discover-card-wrapper" style={{ position: 'relative', maxWidth: '100%', margin: '0 auto', width: '100%' }}>
        <div className="glass-card discover-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 'calc(100vh - 200px)' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="profile-image-container" style={{ width: '100%', aspectRatio: '3/4', maxHeight: '50vh', background: 'linear-gradient(135deg, var(--primary-color), var(--primary-light))', borderRadius: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(60px, 15vw, 100px)', overflow: 'hidden', position: 'relative' }}>
              {match.profile_picture_url ? (
                <img
                  src={match.profile_picture_url.startsWith('http') ? match.profile_picture_url : `${window.location.origin}${match.profile_picture_url}`}
                  alt={`${match.first_name} ${match.last_name}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    // Fallback to emoji if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.parentElement) {
                      target.parentElement.innerHTML = `<span>${emoji}</span>`;
                    }
                  }}
                />
              ) : (
                <span>{emoji}</span>
              )}
            </div>
            <h2 style={{ fontSize: 'clamp(24px, 6vw, 32px)', marginBottom: '8px', fontWeight: 700 }}>{match.first_name} {match.last_name}</h2>
            <div style={{ color: 'var(--text-secondary)', fontSize: 'clamp(16px, 4vw, 20px)', marginBottom: '12px' }}>{match.age} years old</div>
            {match.location_city && (
              <div style={{ color: 'var(--text-secondary)', marginBottom: '12px', fontSize: 'clamp(14px, 3.5vw, 18px)' }}>
                📍 {match.location_city}, {match.location_state || ''}
              </div>
            )}
            {match.denomination && (
              <div style={{ color: 'var(--text-secondary)', marginBottom: '12px', fontSize: 'clamp(14px, 3.5vw, 18px)' }}>
                ⛪ {match.denomination}
              </div>
            )}
            {match.bio && (
              <div style={{ lineHeight: 1.6, marginBottom: '20px', fontSize: 'clamp(14px, 3.5vw, 16px)' }}>{match.bio}</div>
            )}
          </div>
          <div className="swipe-buttons" style={{ display: 'flex', gap: '12px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
            <button
              className="btn-reject"
              onClick={() => handleSwipe(match.user_id, 'reject')}
              style={{ flex: 1, border: '2px solid rgba(255, 59, 48, 0.4)', borderRadius: '16px', cursor: 'pointer', background: 'rgba(255, 59, 48, 0.2)', color: '#FF3B30', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Reject"
              disabled={loading}
            >
              ✕
            </button>
            <button
              className="btn-like"
              onClick={() => handleSwipe(match.user_id, 'like')}
              style={{ flex: 1, border: '2px solid rgba(52, 199, 89, 0.4)', borderRadius: '16px', cursor: 'pointer', background: 'rgba(52, 199, 89, 0.2)', color: '#34C759', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Like"
              disabled={loading}
            >
              ❤️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoverPage;

