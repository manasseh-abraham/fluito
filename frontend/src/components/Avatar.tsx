import { useState } from 'react';
import { initials, resolvePhotoUrl } from '../utils/photo';

type AvatarProps = {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
};

const Avatar = ({ src, name, size = 48, className = '' }: AvatarProps) => {
  const url = resolvePhotoUrl(src);
  const [broken, setBroken] = useState(false);
  const showImage = Boolean(url) && !broken;

  return (
    <div
      className={`avatar ${className}`.trim()}
      style={{ width: size, height: size, fontSize: Math.max(12, size * 0.36) }}
      aria-hidden
    >
      {showImage ? (
        <img src={url!} alt="" onError={() => setBroken(true)} />
      ) : (
        <span>{initials(name)}</span>
      )}
    </div>
  );
};

export default Avatar;
