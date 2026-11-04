import { useEffect, useRef } from 'react';
import { GOOGLE_WEB_CLIENT_ID } from '../config';
import { useAuth } from '../context/AuthContext';
import { getApiError } from '../utils/errors';

const GIS_SRC = 'https://accounts.google.com/gsi/client';

interface GoogleSignInButtonProps {
  disabled?: boolean;
  onStart?: () => void;
  onError?: (message: string) => void;
}

const GoogleSignInButton = ({ disabled, onStart, onError }: GoogleSignInButtonProps) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const { loginWithGoogle } = useAuth();
  const onStartRef = useRef(onStart);
  const onErrorRef = useRef(onError);
  const loginWithGoogleRef = useRef(loginWithGoogle);
  onStartRef.current = onStart;
  onErrorRef.current = onError;
  loginWithGoogleRef.current = loginWithGoogle;

  useEffect(() => {
    let cancelled = false;

    const render = () => {
      const host = buttonRef.current;
      if (cancelled || !host || !window.google?.accounts?.id) return;
      host.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: GOOGLE_WEB_CLIENT_ID,
        callback: async (response) => {
          if (!response.credential) {
            onErrorRef.current?.('Google did not return a sign-in credential.');
            return;
          }
          onStartRef.current?.();
          try {
            await loginWithGoogleRef.current(response.credential);
          } catch (error) {
            onErrorRef.current?.(getApiError(error, 'Google sign-in failed'));
          }
        },
        ux_mode: 'popup',
        context: 'signin',
      });
      const width = Math.min(400, Math.max(240, Math.floor(host.clientWidth || 320)));
      window.google.accounts.id.renderButton(host, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        width,
        logo_alignment: 'left',
      });
    };

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`);
    if (window.google?.accounts?.id) {
      render();
      return () => {
        cancelled = true;
      };
    }

    const script = existing ?? document.createElement('script');
    const handleLoad = () => {
      if (!cancelled) render();
    };
    const handleError = () => {
      onErrorRef.current?.('Could not load Google Sign-In. Check your connection and try again.');
    };
    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);
    if (!existing) {
      script.src = GIS_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <div className={`google-btn-wrap${disabled ? ' is-disabled' : ''}`}>
      <div ref={buttonRef} className="google-btn-host" />
    </div>
  );
};

export default GoogleSignInButton;
