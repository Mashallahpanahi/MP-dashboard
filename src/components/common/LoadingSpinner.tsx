// src/components/common/LoadingSpinner.tsx
import Spinner from '@/components/Spinner/Spinner';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner = ({
  size = 'md',
  text = 'Loading...',
  fullScreen = false,
}: LoadingSpinnerProps) => {
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex flex-col items-center justify-center bg-white/80 z-50'
    : 'flex flex-col items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <Spinner size={size} />
      {text && <p className="mt-4 text-sm text-gray-500">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;