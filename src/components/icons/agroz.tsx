import React from 'react';
// Import the image directly
import agrozLogo from '../icons/Agroz-logo-2.png';

export function AgrozLogo({
  className,
  width,
  height,
}: {
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <img
      src={agrozLogo}
      alt="Agroz Logo"
      width={width}
      height={height}
      className={className}
    />
  );
}