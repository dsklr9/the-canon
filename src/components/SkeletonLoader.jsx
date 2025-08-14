import React from 'react';

const SkeletonLoader = ({ variant = 'default', count = 1, className = '' }) => {
  const variants = {
    // Artist row skeleton
    artistRow: () => (
      <div className="flex items-center gap-3 p-3 bg-black/30 border border-white/10 animate-pulse">
        <div className="w-5 h-5 bg-gray-700 rounded" />
        <div className="w-8 h-6 bg-gray-700 rounded" />
        <div className="w-10 h-10 bg-gray-700 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-700 rounded w-1/2" />
        </div>
      </div>
    ),
    
    // Ranking card skeleton
    rankingCard: () => (
      <div className="bg-slate-800/50 border-2 border-white/10 p-4 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-700 rounded" />
            <div className="h-6 bg-gray-700 rounded w-32" />
          </div>
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-gray-700 rounded" />
            <div className="w-8 h-8 bg-gray-700 rounded" />
          </div>
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-black/30 border border-white/10">
              <div className="w-5 h-5 bg-gray-700 rounded" />
              <div className="w-8 h-6 bg-gray-700 rounded" />
              <div className="w-10 h-10 bg-gray-700 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    
    // Debate/Post skeleton
    debate: () => (
      <div className="bg-slate-800/50 border border-white/10 p-4 animate-pulse">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-gray-700 rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-gray-700 rounded w-1/4 mb-2" />
            <div className="h-3 bg-gray-700 rounded w-1/3" />
          </div>
        </div>
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-700 rounded w-5/6" />
          <div className="h-4 bg-gray-700 rounded w-4/6" />
        </div>
        <div className="flex gap-4">
          <div className="h-8 bg-gray-700 rounded w-16" />
          <div className="h-8 bg-gray-700 rounded w-16" />
          <div className="h-8 bg-gray-700 rounded w-16" />
        </div>
      </div>
    ),
    
    // Face-off skeleton
    faceOff: () => (
      <div className="flex gap-4 animate-pulse">
        <div className="flex-1 bg-slate-800/50 border-2 border-white/10 p-6 text-center">
          <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-4" />
          <div className="h-6 bg-gray-700 rounded w-3/4 mx-auto mb-2" />
          <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto" />
        </div>
        <div className="flex items-center justify-center">
          <div className="text-2xl font-bold text-gray-600">VS</div>
        </div>
        <div className="flex-1 bg-slate-800/50 border-2 border-white/10 p-6 text-center">
          <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-4" />
          <div className="h-6 bg-gray-700 rounded w-3/4 mx-auto mb-2" />
          <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto" />
        </div>
      </div>
    ),
    
    // Simple text line
    text: () => (
      <div className="h-4 bg-gray-700 rounded animate-pulse" />
    ),
    
    // Button skeleton
    button: () => (
      <div className="h-10 bg-gray-700 rounded px-4 animate-pulse" />
    ),
    
    // Default skeleton
    default: () => (
      <div className={`bg-gray-700 rounded animate-pulse ${className}`} />
    )
  };

  const renderSkeleton = variants[variant] || variants.default;

  return (
    <>
      {[...Array(count)].map((_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
};

export default SkeletonLoader;