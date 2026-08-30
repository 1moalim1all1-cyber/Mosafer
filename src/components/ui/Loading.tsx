interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'w-6 h-6 border-2',
  md: 'w-10 h-10 border-4',
  lg: 'w-16 h-16 border-4',
};

export function Loading({ size = 'md', fullScreen = false }: LoadingProps) {
  const spinnerClass = `animate-spin rounded-full border-primary border-t-transparent ${sizeClasses[size]}`;

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
        <div className={spinnerClass} />
      </div>
    );
  }

  return <div className={spinnerClass} />;
}
