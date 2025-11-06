import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

const Toast = ({ message, type = 'info', onClose, duration = 3000 }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bgColor = {
    success: 'rgba(52, 199, 89, 0.9)',
    error: 'rgba(255, 59, 48, 0.9)',
    info: 'rgba(0, 122, 255, 0.9)',
  }[type];

  return (
    <div
      className="toast"
      style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        background: bgColor,
        color: 'white',
        padding: '16px 24px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        zIndex: 1000,
        animation: 'slideIn 0.3s ease-out',
        maxWidth: '300px',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '20px' }}>
          {type === 'success' ? '🎉' : type === 'error' ? '❌' : 'ℹ️'}
        </span>
        <span style={{ fontWeight: 500 }}>{message}</span>
      </div>
    </div>
  );
};

export default Toast;

