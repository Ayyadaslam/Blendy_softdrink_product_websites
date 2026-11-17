import React from 'react';
import { Box } from '../data/blendyData';

interface SpriteCropProps {
  sheet: string;
  box: Box;
  width: number;
  className?: string;
  alt?: string;
  rotate?: number;
  mirror?: boolean;
}

export const SpriteCrop: React.FC<SpriteCropProps> = ({
  sheet,
  box,
  width,
  className = '',
  alt,
  rotate = 0,
  mirror = false,
}) => {
  const [bx, by, bw, bh] = box;
  const s = width / bw;
  const height = bh * s;
  const sheetSize = 2048 * s;

  return (
    <div
      role={alt ? 'img' : undefined}
      aria-label={alt}
      aria-hidden={!alt}
      className={className}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transform: mirror ? 'scaleX(-1)' : undefined,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url("${sheet}")`,
          backgroundSize: `${sheetSize}px ${sheetSize}px`,
          backgroundPosition: `${-bx * s}px ${-by * s}px`,
          backgroundRepeat: 'no-repeat',
          transform: rotate ? `rotate(${rotate}deg)` : undefined,
        }}
      />
    </div>
  );
};
