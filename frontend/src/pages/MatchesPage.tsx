import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchesAPI } from '../services/api';
import type { MatchListItem } from '../services/api';
import { useToast } from '../hooks/useToast';

const MatchesPage = () => {
  const [matches, setMatches] = useState<MatchListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unmatching, setUnmatching] = useState<number | null>(null);
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const response = await matchesAPI.getMatches();
      setMatches(response.data.matches);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1>Your Matches</h1>
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
          <h1>Your Matches</h1>
        </div>
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No matches yet. Start swiping to find your match!</p>
        </div>
      </div>
    );
  }

  const getPhotoUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${window.location.origin}${url}`;
  };

  const handleUnmatch = async (e: React.MouseEvent, matchId: number) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to unmatch this person?')) {
      return;
    }

    try {
      setUnmatching(matchId);
      await matchesAPI.unmatch(matchId);
      showToast('Unmatched successfully', 'info');
      loadMatches();
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to unmatch', 'error');
    } finally {
      setUnmatching(null);
    }
  };

  return (
    <div className="page-container">
      <ToastContainer />
      <div className="page-header">
        <h1>Your Matches</h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {matches.map((match) => {
          const photoUrl = getPhotoUrl(match.profile_picture_url);
          return (
            <div
              key={match.match_id}
              className="glass-card"
              style={{ cursor: 'pointer', transition: 'transform 0.3s ease', overflow: 'hidden', position: 'relative' }}
              onClick={() => navigate(`/messages?match=${match.match_id}`)}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <button
                onClick={(e) => handleUnmatch(e, match.match_id)}
                disabled={unmatching === match.match_id}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(255, 59, 48, 0.2)',
                  border: '1px solid rgba(255, 59, 48, 0.4)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  color: '#FF3B30',
                  fontSize: '12px',
                  cursor: 'pointer',
                  zIndex: 10,
                  fontWeight: 500,
                }}
                title="Unmatch"
              >
                {unmatching === match.match_id ? '...' : '✕'}
              </button>
              <div
                style={{
                  width: '100%',
                  height: '200px',
                  background: photoUrl ? 'transparent' : 'linear-gradient(135deg, var(--primary-color), var(--primary-light))',
                  borderRadius: '16px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '80px',
                  overflow: 'hidden',
                }}
              >
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={`${match.first_name} ${match.last_name}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.innerHTML = '<span>💑</span>';
                        target.parentElement.style.background = 'linear-gradient(135deg, var(--primary-color), var(--primary-light))';
                      }
                    }}
                  />
                ) : (
                  <span>💑</span>
                )}
              </div>
              <h3 style={{ fontSize: '20px', marginBottom: '8px', fontWeight: 600 }}>{match.first_name} {match.last_name}</h3>
              {match.location_city && (
                <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  📍 {match.location_city}, {match.location_state || ''}
                </p>
              )}
              {match.bio && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {match.bio}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MatchesPage;

