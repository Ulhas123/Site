import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 1
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const clampedProgress = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));
  const percentInt = Math.round(clampedProgress * 100);

  return (
    <div
      role="progressbar"
      aria-label="Chapter reading progress"
      aria-valuenow={percentInt}
      aria-valuemin={0}
      aria-valuemax={100}
      className="fixed top-0 left-0 right-0 h-[2px] z-50 pointer-events-none bg-line/20 overflow-hidden"
    >
      <div
        className="h-full bg-accent transition-transform duration-75 ease-out origin-left will-change-transform"
        style={{
          transform: `scaleX(${clampedProgress})`,
        }}
      />
    </div>
  );
};
