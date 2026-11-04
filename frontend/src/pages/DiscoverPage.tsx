import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MatchModal from '../components/MatchModal';
import SafetyActions from '../components/SafetyActions';
import { CloseIcon, HeartIcon, MoreIcon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { matchesAPI } from '../services/api';
import type { Match } from '../services/api';
import { getApiError } from '../utils/errors';
import { initials, resolvePhotoUrl } from '../utils/photo';

const SWIPE_THRESHOLD = 110;

type DragState = { x: number; y: number; dragging: boolean };

const DiscoverPage = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [celebration, setCelebration] = useState<{ person: Match; matchId?: number } | null>(null);
  const [drag, setDrag] = useState<DragState>({ x: 0, y: 0, dragging: false });
  const [exit, setExit] = useState<{ x: number; y: number } | null>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast, ToastContainer } = useToast();

  const loadDiscover = useCallback(async () => {
    try {
      setLoading(true);
      const response = await matchesAPI.discover();
      setMatches(response.data.matches);
      setDrag({ x: 0, y: 0, dragging: false });
      setExit(null);
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number; data?: { profile_complete?: boolean } } })
        .response;
      if (status?.status === 403 && status.data?.profile_complete === false) {
        navigate('/onboarding', { replace: true });
        return;
      }
      console.error('Error loading matches:', error);
      showToast(getApiError(error, 'Could not load Discover'), 'error');
    } finally {
      setLoading(false);
    }
  }, [navigate, showToast]);

  useEffect(() => {
    void loadDiscover();
  }, [loadDiscover]);

  const commitSwipe = async (person: Match, action: 'like' | 'reject') => {
    const dir = action === 'like' ? 1 : -1;
    setBusy(true);
    setExit({ x: dir * 520, y: 36 });
    await new Promise((resolve) => setTimeout(resolve, 260));
    setMatches((prev) => prev.filter((item) => item.user_id !== person.user_id));
    setDrag({ x: 0, y: 0, dragging: false });
    setExit(null);

    try {
      const response = await matchesAPI.swipe(person.user_id, action);
      if (response.data.matched) {
        let matchId: number | undefined;
        try {
          const list = await matchesAPI.getMatches();
          matchId = list.data.matches.find((item) => item.other_user_id === person.user_id)?.match_id;
        } catch {
          /* keep swiping even if match lookup fails */
        }
        setCelebration({ person, matchId });
      } else if (matches.filter((item) => item.user_id !== person.user_id).length === 0) {
        void loadDiscover();
      }
    } catch (error) {
      console.error('Error swiping:', error);
      showToast('Error processing swipe', 'error');
      setMatches((prev) => [person, ...prev.filter((item) => item.user_id !== person.user_id)]);
    } finally {
      setBusy(false);
    }
  };

  const top = matches[0];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!top || busy || celebration) return;
      if (event.key === 'ArrowLeft') void commitSwipe(top, 'reject');
      if (event.key === 'ArrowRight') void commitSwipe(top, 'like');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [top, busy, celebration]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (busy || (event.target as HTMLElement).closest('button')) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerStart.current = { x: event.clientX, y: event.clientY };
    setDrag({ x: 0, y: 0, dragging: true });
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerStart.current || !drag.dragging) return;
    setDrag({
      x: event.clientX - pointerStart.current.x,
      y: event.clientY - pointerStart.current.y,
      dragging: true,
    });
  };

  const onPointerUp = () => {
    if (!pointerStart.current || !top) {
      setDrag({ x: 0, y: 0, dragging: false });
      return;
    }
    const dx = drag.x;
    pointerStart.current = null;
    if (dx > SWIPE_THRESHOLD) {
      void commitSwipe(top, 'like');
      return;
    }
    if (dx < -SWIPE_THRESHOLD) {
      void commitSwipe(top, 'reject');
      return;
    }
    setDrag({ x: 0, y: 0, dragging: false });
  };

  if (loading) {
    return (
      <div className="discover-screen">
        <ToastContainer />
        <div className="centered-state">
          <div className="loader" />
        </div>
      </div>
    );
  }

  if (!top) {
    return (
      <div className="discover-screen">
        <ToastContainer />
        <div className="centered-state">
          <h2>You&apos;re all caught up</h2>
          <p>No more people nearby right now. Check back later.</p>
          <button type="button" className="btn-primary" onClick={() => void loadDiscover()}>
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const x = exit?.x ?? drag.x;
  const y = exit?.y ?? drag.y;
  const rotate = x / 18;
  const likeOpacity = Math.min(1, Math.max(0, x / 120));
  const nopeOpacity = Math.min(1, Math.max(0, -x / 120));
  const transitioning = Boolean(exit) || !drag.dragging;

  return (
    <div className="discover-screen">
      <ToastContainer />
      <div className="deck">
        {matches.slice(0, 3).reverse().map((match, index, stacked) => {
          const isTop = index === stacked.length - 1;
          const photo = resolvePhotoUrl(match.profile_picture_url);
          const name = `${match.first_name} ${match.last_name}`;
          const transform = isTop
            ? `translate(${x}px, ${y}px) rotate(${rotate}deg)`
            : `scale(${1 - (stacked.length - 1 - index) * 0.04}) translateY(${(stacked.length - 1 - index) * 10}px)`;

          return (
            <div
              key={match.user_id}
              className={`swipe-card${isTop ? '' : ' is-under'}`}
              style={{
                transform,
                transition: transitioning && isTop ? 'transform 0.28s ease' : isTop ? 'none' : 'transform 0.2s ease',
                zIndex: index + 1,
              }}
              onPointerDown={isTop ? onPointerDown : undefined}
              onPointerMove={isTop ? onPointerMove : undefined}
              onPointerUp={isTop ? onPointerUp : undefined}
              onPointerCancel={isTop ? onPointerUp : undefined}
            >
              {photo ? (
                <img
                  className="swipe-photo"
                  src={photo}
                  alt={name}
                  draggable={false}
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                    const fallback = event.currentTarget.nextElementSibling as HTMLElement | null;
                    if (fallback) fallback.style.display = 'grid';
                  }}
                />
              ) : null}
              <div className="swipe-fallback" style={{ display: photo ? 'none' : 'grid' }}>
                {initials(name)}
              </div>
              <div className="swipe-gradient" />
              <div className="swipe-meta">
                <div className="swipe-name">
                  {match.first_name}, <span>{match.age}</span>
                </div>
                {(match.location_city || match.denomination) && (
                  <div className="swipe-line">
                    {[match.location_city, match.location_state, match.denomination]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                )}
                {match.bio && <div className="swipe-bio">{match.bio}</div>}
              </div>
              {isTop && (
                <>
                  <div className="stamp stamp-like" style={{ opacity: likeOpacity }}>
                    Like
                  </div>
                  <div className="stamp stamp-nope" style={{ opacity: nopeOpacity }}>
                    Nope
                  </div>
                  <button
                    type="button"
                    className="btn-icon card-more"
                    aria-label="Block or report"
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => setSafetyOpen(true)}
                  >
                    <MoreIcon size={18} />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="action-row">
        <button
          type="button"
          className="action-btn action-btn--nope"
          aria-label="Nope"
          disabled={busy}
          onClick={() => void commitSwipe(top, 'reject')}
        >
          <CloseIcon size={28} />
        </button>
        <button
          type="button"
          className="action-btn action-btn--like"
          aria-label="Like"
          disabled={busy}
          onClick={() => void commitSwipe(top, 'like')}
        >
          <HeartIcon size={30} />
        </button>
      </div>

      {safetyOpen && (
        <SafetyActions
          displayName={`${top.first_name} ${top.last_name}`}
          targetUserId={top.user_id}
          onClose={() => setSafetyOpen(false)}
          onDone={(action) => {
            setSafetyOpen(false);
            showToast(action === 'reported' ? 'Report submitted and user blocked' : 'User blocked', 'info');
            void loadDiscover();
          }}
        />
      )}

      {celebration && (
        <MatchModal
          person={celebration.person}
          selfName={user ? `${user.first_name} ${user.last_name}` : 'You'}
          selfPhoto={user?.profile_picture_url}
          onMessage={() => {
            const matchId = celebration.matchId;
            setCelebration(null);
            navigate(matchId ? `/messages?match=${matchId}` : '/messages');
          }}
          onKeepSwiping={() => {
            setCelebration(null);
            if (matches.length === 0) void loadDiscover();
          }}
        />
      )}
    </div>
  );
};

export default DiscoverPage;
