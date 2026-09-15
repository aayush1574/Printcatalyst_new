import React from 'react';

/**
 * Reusable Loading Skeleton Components with Shimmer Animations
 */

export function Shimmer({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-slate-800 via-slate-700/60 to-slate-800 rounded-lg ${className}`}
    />
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/5 space-y-4 shadow-lg animate-fadeIn">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Shimmer className="w-10 h-10 rounded-xl flex-shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Shimmer className="h-4 w-32" />
            <Shimmer className="h-3 w-20" />
          </div>
        </div>
        <Shimmer className="h-6 w-16 rounded-full" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/5">
        <Shimmer className="h-8 rounded-xl" />
        <Shimmer className="h-8 rounded-xl" />
        <Shimmer className="h-8 rounded-xl" />
        <Shimmer className="h-8 rounded-xl" />
      </div>

      <div className="flex items-center justify-between pt-2">
        <Shimmer className="h-4 w-24" />
        <div className="flex gap-2">
          <Shimmer className="h-8 w-20 rounded-xl" />
          <Shimmer className="h-8 w-20 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="glass-card rounded-2xl p-4 sm:p-5 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <Shimmer className="h-3 w-16" />
            <Shimmer className="w-6 h-6 rounded-lg" />
          </div>
          <Shimmer className="h-7 w-24" />
          <Shimmer className="h-2 w-16" />
        </div>
      ))}
    </div>
  );
}

export function DocumentPreviewSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4 min-h-[300px]">
      <Shimmer className="w-48 h-64 rounded-xl shadow-2xl" />
      <Shimmer className="h-4 w-36" />
      <div className="flex gap-2">
        <Shimmer className="h-8 w-24 rounded-xl" />
        <Shimmer className="h-8 w-24 rounded-xl" />
      </div>
    </div>
  );
}

export default {
  Shimmer,
  OrderCardSkeleton,
  MetricsSkeleton,
  DocumentPreviewSkeleton
};
