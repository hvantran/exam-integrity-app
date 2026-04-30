import React from 'react';

export interface SkeletonProps {
  className?: string;
  height?: string | number;
  width?: string | number;
  rounded?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', height = 16, width = '100%', rounded = true }) => {
  const style = {
    height: typeof height === 'number' ? `${height}px` : height,
    width: typeof width === 'number' ? `${width}px` : width,
  };
  return (
    <div
      className={`bg-gray-200 animate-pulse ${rounded ? 'rounded-lg' : ''} ${className}`.trim()}
      style={style}
    />
  );
};

export default Skeleton;
