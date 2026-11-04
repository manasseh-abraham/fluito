import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import Avatar from '../components/Avatar';
import LegalLinks from '../components/LegalLinks';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import type { Profile, Preferences } from '../services/api';
import { getApiError } from '../utils/errors';

const ProfilePage = () => {
  const { user, updateProfile, deleteAccount, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [preferences, setPreferences] = useState<Partial<Preferences>>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [message, setMessage] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setProfile({
        first_name: user.first_name,
        last_name: user.last_name,
        denomination: user.denomination || '',
        church_name: user.church_name || '',
        location_city: user.location_city || '',
        location_state: user.location_state || '',
        bio: user.bio || '',
        profile_picture_url: user.profile_picture_url || '',
      });
    }
    void loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    try {
      const response = await profileAPI.getPreferences();
      setPreferences(response.data);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleProfileUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await profileAPI.updateProfile(profile);
      setMessage('Profile updated successfully!');
      await updateProfile();
    } catch (error) {
      setMessage(getApiError(error, 'Failed to update profile'));
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await profileAPI.updatePreferences(preferences);
      setMessage('Preferences updated successfully!');
      await loadPreferences();
    } catch (error) {
      setMessage(getApiError(error, 'Failed to update preferences'));
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file');
      return;
    }

    const maxRecommendedSize = 20 * 1024 * 1024;
    if (file.size > maxRecommendedSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      if (!confirm(`This image is ${sizeMB}MB. It will be compressed before upload. Continue?`)) {
        return;
      }
    }

    setCompressing(true);
    setUploading(false);
    setMessage('Compressing image...');

    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 5,
        maxWidthOrHeight: 2000,
        useWebWorker: true,
        fileType: file.type,
        initialQuality: 0.8,
      });

      setCompressing(false);
      setUploading(true);
      setMessage('Uploading compressed image...');

      const response = await profileAPI.uploadPhoto(compressedFile);
      setMessage('Photo uploaded successfully!');
      setProfile({ ...profile, profile_picture_url: response.data.profile_picture_url });
      await updateProfile();
    } catch (error) {
      console.error('Error uploading photo:', error);
      const maybeMessage = error instanceof Error ? error.message : '';
      if (maybeMessage.includes('compression')) {
        setMessage('Failed to compress image. Please try a smaller image.');
      } else {
        setMessage(getApiError(error, 'Failed to upload photo'));
      }
    } finally {
      setCompressing(false);
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm.trim() !== 'DELETE') {
      setMessage('Type DELETE to confirm account deletion');
      return;
    }
    setDeleting(true);
    try {
      await deleteAccount();
      navigate('/', { replace: true });
    } catch (error) {
      setMessage(getApiError(error, 'Could not delete account'));
      setDeleting(false);
    }
  };

  const displayName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'You';
  const success = message.includes('successfully');

  return (
    <div>
      <h1 className="screen-title">Profile</h1>
      <div className="stack">
        <div className="profile-hero">
          <Avatar src={profile.profile_picture_url} name={displayName} size={120} className="avatar--lg" />
          <h2>
            {displayName}
            {user?.age ? `, ${user.age}` : ''}
          </h2>
          <p>{user?.email}</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handlePhotoUpload}
            style={{ display: 'none' }}
            id="photo-upload"
          />
          <button
            type="button"
            className="btn-primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || compressing}
            style={{ width: 'auto', padding: '12px 28px' }}
          >
            {compressing ? 'Compressing...' : uploading ? 'Uploading...' : 'Upload photo'}
          </button>
          <p>JPEG, PNG, or WebP. Images are compressed before upload.</p>
        </div>

        <div className="surface-card">
          <h3>Edit profile</h3>
          <form onSubmit={handleProfileUpdate}>
            <div className="form-group">
              <label>First name</label>
              <input
                type="text"
                value={profile.first_name || ''}
                onChange={(event) => setProfile({ ...profile, first_name: event.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Last name</label>
              <input
                type="text"
                value={profile.last_name || ''}
                onChange={(event) => setProfile({ ...profile, last_name: event.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Denomination</label>
              <input
                type="text"
                value={profile.denomination || ''}
                onChange={(event) => setProfile({ ...profile, denomination: event.target.value })}
                placeholder="e.g., Pentecostal"
              />
            </div>
            <div className="form-group">
              <label>Church name</label>
              <input
                type="text"
                value={profile.church_name || ''}
                onChange={(event) => setProfile({ ...profile, church_name: event.target.value })}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  value={profile.location_city || ''}
                  onChange={(event) => setProfile({ ...profile, location_city: event.target.value })}
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  value={profile.location_state || ''}
                  onChange={(event) => setProfile({ ...profile, location_state: event.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={profile.bio || ''}
                onChange={(event) => setProfile({ ...profile, bio: event.target.value })}
                rows={4}
                maxLength={1000}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save profile'}
            </button>
          </form>
        </div>

        <div className="surface-card">
          <h3>Discovery preferences</h3>
          <form onSubmit={handlePreferencesUpdate}>
            <div className="form-row">
              <div className="form-group">
                <label>Min age</label>
                <input
                  type="number"
                  value={preferences.min_age || ''}
                  onChange={(event) =>
                    setPreferences({ ...preferences, min_age: parseInt(event.target.value, 10) || undefined })
                  }
                  min={18}
                  max={100}
                />
              </div>
              <div className="form-group">
                <label>Max age</label>
                <input
                  type="number"
                  value={preferences.max_age || ''}
                  onChange={(event) =>
                    setPreferences({ ...preferences, max_age: parseInt(event.target.value, 10) || undefined })
                  }
                  min={18}
                  max={100}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Preferred gender</label>
              <div className="chip-row">
                {(['both', 'male', 'female'] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`chip${(preferences.preferred_gender || 'both') === value ? ' selected' : ''}`}
                    onClick={() => setPreferences({ ...preferences, preferred_gender: value })}
                  >
                    {value === 'both' ? 'Everyone' : value === 'male' ? 'Men' : 'Women'}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Denomination preference</label>
              <input
                type="text"
                value={preferences.denomination_preference || ''}
                onChange={(event) =>
                  setPreferences({ ...preferences, denomination_preference: event.target.value || undefined })
                }
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save preferences'}
            </button>
          </form>
        </div>

        {message && <div className={success ? 'banner-success' : 'error-message'}>{message}</div>}

        <div className="surface-card">
          <LegalLinks />
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              logout();
              navigate('/', { replace: true });
            }}
          >
            Log out
          </button>
        </div>

        <div className="surface-card danger-card">
          <h3>Delete account</h3>
          <p className="modal-copy">
            Permanently deletes your profile, photos, matches, and messages. This cannot be undone.
          </p>
          <button type="button" className="btn-danger" onClick={() => setDeleteOpen(true)}>
            Delete my account
          </button>
        </div>
      </div>

      {deleteOpen && (
        <div className="overlay" onClick={() => !deleting && setDeleteOpen(false)} role="presentation">
          <div className="overlay-panel overlay-panel--dialog" onClick={(event) => event.stopPropagation()}>
            <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="delete-title">
              <h3 id="delete-title">Delete account?</h3>
              <p className="modal-copy">
                This permanently deletes your profile, photos, matches, and messages. Type DELETE to confirm.
              </p>
              <div className="form-group">
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={(event) => setDeleteConfirm(event.target.value)}
                  placeholder="DELETE"
                  autoFocus
                />
              </div>
              <button
                type="button"
                className="btn-danger"
                disabled={deleting || deleteConfirm.trim() !== 'DELETE'}
                onClick={() => void handleDeleteAccount()}
              >
                {deleting ? 'Deleting…' : 'Delete forever'}
              </button>
              <button
                type="button"
                className="btn-text"
                disabled={deleting}
                onClick={() => {
                  setDeleteOpen(false);
                  setDeleteConfirm('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
