import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import type { Profile, Preferences } from '../services/api';
import imageCompression from 'browser-image-compression';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [preferences, setPreferences] = useState<Partial<Preferences>>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [message, setMessage] = useState('');
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
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    try {
      const response = await profileAPI.getPreferences();
      setPreferences(response.data);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await profileAPI.updateProfile(profile);
      setMessage('Profile updated successfully!');
      await updateProfile();
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await profileAPI.updatePreferences(preferences);
      setMessage('Preferences updated successfully!');
      await loadPreferences();
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file');
      return;
    }

    // Warn if file is very large (but still allow it - compression will handle it)
    const maxRecommendedSize = 20 * 1024 * 1024; // 20MB
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
      // Compress image before upload
      // Options: max size 5MB, max width/height 2000px, quality 0.8
      const options = {
        maxSizeMB: 5,
        maxWidthOrHeight: 2000,
        useWebWorker: true,
        fileType: file.type,
        initialQuality: 0.8,
      };

      const compressedFile = await imageCompression(file, options);
      
      // Check if compression helped
      const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const compressedSizeMB = (compressedFile.size / (1024 * 1024)).toFixed(2);
      
      console.log(`Original size: ${originalSizeMB}MB, Compressed size: ${compressedSizeMB}MB`);

      setCompressing(false);
      setUploading(true);
      setMessage('Uploading compressed image...');

      const response = await profileAPI.uploadPhoto(compressedFile);
      setMessage('Photo uploaded successfully!');
      setProfile({ ...profile, profile_picture_url: response.data.profile_picture_url });
      await updateProfile();
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      if (error.message?.includes('compression')) {
        setMessage('Failed to compress image. Please try a smaller image.');
      } else {
        setMessage(error.response?.data?.error || 'Failed to upload photo');
      }
    } finally {
      setCompressing(false);
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getPhotoUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${window.location.origin}${url}`;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Profile</h1>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
        {/* Profile Photo Section */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '20px' }}>Profile Photo</h3>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div
              className="profile-photo-preview"
              style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary-color), var(--primary-light))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '60px',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {getPhotoUrl(profile.profile_picture_url) ? (
                <img
                  src={getPhotoUrl(profile.profile_picture_url)!}
                  alt="Profile"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <span>{user?.first_name?.[0]?.toUpperCase() || '👤'}</span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
              id="photo-upload"
            />
            <label htmlFor="photo-upload">
              <button
                type="button"
                className="btn-primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || compressing}
                style={{ width: 'auto', padding: '12px 24px', cursor: (uploading || compressing) ? 'not-allowed' : 'pointer' }}
              >
                {compressing ? 'Compressing...' : uploading ? 'Uploading...' : 'Upload Photo'}
              </button>
            </label>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center' }}>
              JPEG, PNG, or WebP. Images will be automatically compressed before upload
            </p>
          </div>
        </div>

        <div className="glass-card">
          <form onSubmit={handleProfileUpdate}>
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                value={profile.first_name || ''}
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                value={profile.last_name || ''}
                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Denomination</label>
              <input
                type="text"
                value={profile.denomination || ''}
                onChange={(e) => setProfile({ ...profile, denomination: e.target.value })}
                placeholder="e.g., Pentecostal"
              />
            </div>
            <div className="form-group">
              <label>Church Name</label>
              <input
                type="text"
                value={profile.church_name || ''}
                onChange={(e) => setProfile({ ...profile, church_name: e.target.value })}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  value={profile.location_city || ''}
                  onChange={(e) => setProfile({ ...profile, location_city: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  value={profile.location_state || ''}
                  onChange={(e) => setProfile({ ...profile, location_state: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={profile.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={4}
                maxLength={1000}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        <div className="glass-card">
          <h3 style={{ marginBottom: '20px' }}>Preferences</h3>
          <form onSubmit={handlePreferencesUpdate}>
            <div className="form-row">
              <div className="form-group">
                <label>Min Age</label>
                <input
                  type="number"
                  value={preferences.min_age || ''}
                  onChange={(e) => setPreferences({ ...preferences, min_age: parseInt(e.target.value) || undefined })}
                  min={18}
                  max={100}
                />
              </div>
              <div className="form-group">
                <label>Max Age</label>
                <input
                  type="number"
                  value={preferences.max_age || ''}
                  onChange={(e) => setPreferences({ ...preferences, max_age: parseInt(e.target.value) || undefined })}
                  min={18}
                  max={100}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Preferred Gender</label>
              <select
                value={preferences.preferred_gender || 'both'}
                onChange={(e) => setPreferences({ ...preferences, preferred_gender: e.target.value as 'male' | 'female' | 'both' })}
              >
                <option value="both">Both</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="form-group">
              <label>Denomination Preference</label>
              <input
                type="text"
                value={preferences.denomination_preference || ''}
                onChange={(e) => setPreferences({ ...preferences, denomination_preference: e.target.value || undefined })}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Preferences'}
            </button>
          </form>
        </div>

        {message && (
          <div
            className="error-message"
            style={{
              background: message.includes('successfully') ? 'rgba(52, 199, 89, 0.15)' : 'rgba(255, 59, 48, 0.15)',
              borderColor: message.includes('successfully') ? 'rgba(52, 199, 89, 0.4)' : 'rgba(255, 59, 48, 0.4)',
              color: message.includes('successfully') ? '#34C759' : '#FF3B30',
            }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

