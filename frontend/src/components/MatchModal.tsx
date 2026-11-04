import type { Match } from '../services/api';
import Avatar from './Avatar';

type MatchModalProps = {
  person: Match;
  selfName: string;
  selfPhoto?: string | null;
  onMessage: () => void;
  onKeepSwiping: () => void;
};

const MatchModal = ({ person, selfName, selfPhoto, onMessage, onKeepSwiping }: MatchModalProps) => {
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="match-title">
      <div className="overlay-panel">
        <div className="match-hero">
          <h2 id="match-title" className="match-title">
            It&apos;s a Match!
          </h2>
          <p className="match-sub">You and {person.first_name} liked each other</p>
          <div className="match-photos">
            <Avatar src={selfPhoto} name={selfName} size={128} />
            <Avatar
              src={person.profile_picture_url}
              name={`${person.first_name} ${person.last_name}`}
              size={128}
            />
          </div>
        </div>
        <div className="match-actions">
          <button type="button" className="btn-primary" onClick={onMessage}>
            Send a Message
          </button>
          <button type="button" className="btn-ghost" onClick={onKeepSwiping}>
            Keep Swiping
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchModal;
