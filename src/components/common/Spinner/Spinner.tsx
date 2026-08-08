import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'text-primary-500',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`${sizeMap[size]} ${color} rounded-full border-solid border-t-transparent animate-spin`}
        style={{ borderColor: 'currentColor', borderTopColor: 'transparent' }}
      />
    </div>
  );
};

export default Spinner;