type IconProps = {
  size?: number;
  className?: string;
};

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const FlameIcon = ({ size = 26, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
    <path
      d="M12 3c1.4 3.2-.2 4.8-1.3 6.2C9.4 10.6 8.5 11.8 8.5 14A3.5 3.5 0 0 0 12 17.5 3.5 3.5 0 0 0 15.5 14c0-2.6-1.4-4.2-1.4-6.4 0-1.2.4-2.2 1-3.1C13.4 6.2 12.6 7 12 8.2 11.2 6.6 11.3 4.8 12 3Z"
      fill="currentColor"
    />
  </svg>
);

export const HeartIcon = ({ size = 26, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
    <path
      d="M12 20s-7-4.4-9.2-8.2C1.2 9.2 2.2 6 5.2 5.2 7.1 4.7 8.8 5.5 12 8.2c3.2-2.7 4.9-3.5 6.8-3C21.8 6 22.8 9.2 21.2 11.8 19 15.6 12 20 12 20Z"
      fill="currentColor"
    />
  </svg>
);

export const ChatIcon = ({ size = 26, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
    <path
      d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-4.5 3.2c-.8.6-1.5.2-1.5-.8V17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
      fill="currentColor"
    />
  </svg>
);

export const PersonIcon = ({ size = 26, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
    <circle cx="12" cy="8" r="3.2" fill="currentColor" />
    <path d="M5.2 19c.6-3.2 3.2-5 6.8-5s6.2 1.8 6.8 5" fill="currentColor" />
  </svg>
);

export const CloseIcon = ({ size = 26, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
    <path {...stroke} strokeWidth={2.4} d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const SendIcon = ({ size = 20, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
    <path d="M4 12L20 5l-6.5 14-2.2-5.3L4 12Z" fill="currentColor" />
  </svg>
);

export const BackIcon = ({ size = 22, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
    <path {...stroke} strokeWidth={2.2} d="M15 5L8 12l7 7" />
  </svg>
);

export const MoreIcon = ({ size = 22, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
    <circle cx="6" cy="12" r="1.6" fill="currentColor" />
    <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    <circle cx="18" cy="12" r="1.6" fill="currentColor" />
  </svg>
);
