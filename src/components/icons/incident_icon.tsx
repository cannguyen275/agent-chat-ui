import React from 'react';
// Import the image directly
import incidentIcon from './incident_icon.png';

export function IncidentLogo({
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
      src={incidentIcon.src}
      alt="Incident Logo"
      width={width}
      height={height}
      className={className}
    />
  );
}
