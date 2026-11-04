import { useState } from 'react';
import { REPORT_REASONS, matchesAPI, reportsAPI } from '../services/api';
import type { ReportReason } from '../services/api';
import { getApiError } from '../utils/errors';

const REASON_LABELS: Record<ReportReason, string> = {
  harassment: 'Harassment',
  fake_profile: 'Fake profile',
  inappropriate_content: 'Inappropriate content',
  spam: 'Spam',
  underage: 'Underage',
  other: 'Other',
};

type Step = 'menu' | 'report' | 'confirm-block' | 'confirm-report';

interface SafetyActionsProps {
  displayName: string;
  targetUserId?: number;
  matchId?: number;
  onDone: (action: 'blocked' | 'reported') => void;
  onClose: () => void;
}

const SafetyActions = ({
  displayName,
  targetUserId,
  matchId,
  onDone,
  onClose,
}: SafetyActionsProps) => {
  const [step, setStep] = useState<Step>('menu');
  const [reason, setReason] = useState<ReportReason>('harassment');
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleBlock = async () => {
    setBusy(true);
    setError('');
    try {
      await matchesAPI.block({ target_user_id: targetUserId, match_id: matchId });
      onDone('blocked');
    } catch (err) {
      setError(getApiError(err, 'Failed to block user'));
      setBusy(false);
    }
  };

  const handleReport = async () => {
    setBusy(true);
    setError('');
    try {
      await reportsAPI.report({
        reported_user_id: targetUserId,
        match_id: matchId,
        reason,
        details: details.trim() || undefined,
        block: true,
      });
      onDone('reported');
    } catch (err) {
      setError(getApiError(err, 'Failed to submit report'));
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="glass-card modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="safety-title"
      >
        {step === 'menu' && (
          <>
            <h3 id="safety-title">{displayName}</h3>
            <p className="modal-copy">Hide them from Discover and messages, or tell us why.</p>
            <button type="button" className="btn-danger" onClick={() => setStep('confirm-block')}>
              Block
            </button>
            <button type="button" className="btn-secondary" onClick={() => setStep('report')}>
              Report
            </button>
            <button type="button" className="btn-text" onClick={onClose}>
              Cancel
            </button>
          </>
        )}

        {step === 'report' && (
          <>
            <h3 id="safety-title">Why are you reporting?</h3>
            <div className="reason-list">
              {REPORT_REASONS.map((value) => (
                <label key={value} className={`reason-option${reason === value ? ' selected' : ''}`}>
                  <input
                    type="radio"
                    name="report-reason"
                    value={value}
                    checked={reason === value}
                    onChange={() => setReason(value)}
                  />
                  {REASON_LABELS[value]}
                </label>
              ))}
            </div>
            {reason === 'other' && (
              <div className="form-group">
                <textarea
                  value={details}
                  onChange={(event) => setDetails(event.target.value)}
                  maxLength={2000}
                  rows={3}
                  placeholder="Optional details"
                />
              </div>
            )}
            <button type="button" className="btn-danger" onClick={() => setStep('confirm-report')}>
              Continue
            </button>
            <button type="button" className="btn-text" onClick={() => setStep('menu')}>
              Back
            </button>
          </>
        )}

        {step === 'confirm-block' && (
          <>
            <h3 id="safety-title">Block {displayName}?</h3>
            <p className="modal-copy">
              They will disappear from Discover, Matches, and chat. You cannot undo this from the
              app besides staying blocked.
            </p>
            <button type="button" className="btn-danger" disabled={busy} onClick={handleBlock}>
              {busy ? 'Blocking…' : 'Block'}
            </button>
            <button type="button" className="btn-text" disabled={busy} onClick={() => setStep('menu')}>
              Cancel
            </button>
          </>
        )}

        {step === 'confirm-report' && (
          <>
            <h3 id="safety-title">Report {displayName}?</h3>
            <p className="modal-copy">
              We will store this report and block them so they no longer appear for you.
            </p>
            <button type="button" className="btn-danger" disabled={busy} onClick={handleReport}>
              {busy ? 'Reporting…' : 'Report & block'}
            </button>
            <button type="button" className="btn-text" disabled={busy} onClick={() => setStep('report')}>
              Back
            </button>
          </>
        )}

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default SafetyActions;
