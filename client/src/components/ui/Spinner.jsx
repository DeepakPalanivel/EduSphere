export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <div className={`${sizes[size]} ${className} animate-spin rounded-full`}
      style={{ border: '2px solid rgba(168,85,247,0.15)', borderTopColor: '#a855f7' }} />
  );
};

export const PageSpinner = () => (
  <div className="flex items-center justify-center min-h-[40vh]">
    <div className="text-center">
      <Spinner size="lg" className="mx-auto mb-3" />
      <p className="text-sm text-slate-500">Loading...</p>
    </div>
  </div>
);
