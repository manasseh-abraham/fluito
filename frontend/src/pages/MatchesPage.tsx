import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SafetyActions from '../components/SafetyActions';
import { MoreIcon } from '../components/Icons';
import { matchesAPI } from '../services/api';
import type { MatchListItem } from '../services/api';
import { useToast } from '../hooks/useToast';
import { getApiError } from '../utils/errors';
import { initials, resolvePhotoUrl } from '../utils/photo';

const MatchesPage = () => {
  const [matches, setMatches] = useState<MatchListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unmatching, setUnmatching] = useState<number | null>(null);
  const [menuTarget, setMenuTarget] = useState<MatchListItem | null>(null);
  const [safetyTarget, setSafetyTarget] = useState<MatchListItem | null>(null);
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();

  const loadMatches = async () => {
    try {
      setLoading(true);
      const response = await matchesAPI.getMatches();
      setMatches(response.data.matches);
    } catch (error) {
      console.error('Error loading matches:', error);
      showToast(getApiError(error, 'Could not load matches'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUnmatch = async (matchId: number) => {
    if (!confirm('Unmatch this person? You will lose this conversation.')) return;
    try {
      setUnmatching(matchId);
      await matchesAPI.unmatch(matchId);
      setMenuTarget(null);
      showToast('Unmatched', 'info');
      await loadMatches();
    } catch (error) {
      showToast(getApiError(error, 'Failed to unmatch'), 'error');
    } finally {
      setUnmatching(null);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="screen-title">Matches</h1>
        <div className="centered-state">
          <div className="loader" />
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div>
        <ToastContainer />
        <h1 className="screen-title">Matches</h1>
        <div className="centered-state">
          <h2>No matches yet</h2>
          <p>Start swiping to find your God-fearing partner.</p>
          <button type="button" className="btn-primary" onClick={() => navigate('/discover')}>
            Discover people
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ToastContainer />
      <h1 className="screen-title">Matches</h1>
      <div className="matches-grid">
        {matches.map((match) => {
          const photoUrl = resolvePhotoUrl(match.profile_picture_url);
          const name = `${match.first_name} ${match.last_name}`;
          return (
            <div key={match.match_id} className="match-tile">
              <button
                type="button"
                className="match-tile-hit"
                onClick={() => navigate(`/messages?match=${match.match_id}`)}
                aria-label={`Message ${name}`}
              >
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt=""
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                      const fallback = event.currentTarget.nextElementSibling as HTMLElement | null;
                      if (fallback) fallback.style.display = 'grid';
                    }}
                  />
                ) : null}
                <div className="match-tile-fallback" style={{ display: photoUrl ? 'none' : 'grid' }}>
                  {initials(name)}
                </div>
                <div className="match-tile-grad" />
                <div className="match-tile-name">{match.first_name}</div>
              </button>
              <button
                type="button"
                className="btn-icon match-tile-menu"
                aria-label={`More actions for ${name}`}
                onClick={(event) => {
                  event.stopPropagation();
                  setMenuTarget(match);
                }}
              >
                <MoreIcon size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {menuTarget && (
        <div className="overlay" onClick={() => setMenuTarget(null)} role="presentation">
          <div className="overlay-panel overlay-panel--dialog" onClick={(event) => event.stopPropagation()}>
            <div className="modal-card">
              <h3>
                {menuTarget.first_name} {menuTarget.last_name}
              </h3>
              <p className="modal-copy">Message them, unmatch, or keep this community safe.</p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => navigate(`/messages?match=${menuTarget.match_id}`)}
              >
                Message
              </button>
              <button
                type="button"
                className="btn-secondary"
                disabled={unmatching === menuTarget.match_id}
                onClick={() => void handleUnmatch(menuTarget.match_id)}
              >
                {unmatching === menuTarget.match_id ? 'Unmatching…' : 'Unmatch'}
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={() => {
                  setSafetyTarget(menuTarget);
                  setMenuTarget(null);
                }}
              >
                Block / Report
              </button>
              <button type="button" className="btn-text" onClick={() => setMenuTarget(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {safetyTarget && (
        <SafetyActions
          displayName={`${safetyTarget.first_name} ${safetyTarget.last_name}`}
          matchId={safetyTarget.match_id}
          targetUserId={safetyTarget.other_user_id}
          onClose={() => setSafetyTarget(null)}
          onDone={(action) => {
            setSafetyTarget(null);
            showToast(action === 'reported' ? 'Report submitted and user blocked' : 'User blocked', 'info');
            void loadMatches();
          }}
        />
      )}
    </div>
  );
};

export default MatchesPage;
