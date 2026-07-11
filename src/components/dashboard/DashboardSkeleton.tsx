import React from 'react';

const DashboardSkeleton: React.FC = () => {
  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl animate-pulse">
      
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b border-border/50">
        <div className="w-full md:w-1/2">
          <div className="h-8 bg-muted rounded w-48 mb-3"></div>
          <div className="h-4 bg-muted rounded w-3/4 max-w-md"></div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="h-11 bg-muted rounded w-40"></div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-border p-6 h-[132px] flex flex-col justify-between">
             <div className="flex justify-between items-start">
               <div className="h-4 bg-muted rounded w-24"></div>
               <div className="w-9 h-9 bg-muted rounded-full"></div>
             </div>
             <div>
               <div className="h-8 bg-muted rounded w-16 mb-2"></div>
               <div className="h-3 bg-muted rounded w-32"></div>
             </div>
          </div>
        ))}
      </div>

      {/* Topic Highlights Skeleton */}
      <div className="grid lg:grid-cols-2 gap-6 mb-10">
         {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-border p-6 h-48 flex flex-col">
            <div className="flex justify-between items-center mb-6">
               <div className="h-4 bg-muted rounded w-32"></div>
               <div className="w-5 h-5 bg-muted rounded-full"></div>
            </div>
            <div className="flex-1 flex flex-col justify-end">
               <div className="h-7 bg-muted rounded w-3/4 mb-4"></div>
               <div className="flex justify-between mb-3">
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="h-4 bg-muted rounded w-12"></div>
               </div>
               <div className="h-3 bg-muted rounded-full w-full"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Feed Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden min-h-[300px]">
         <div className="p-5 border-b border-border/50 bg-slate-50/50 flex justify-between items-center">
            <div className="h-5 bg-muted rounded w-32"></div>
            <div className="h-6 bg-muted rounded-full w-24"></div>
         </div>
         <div className="divide-y divide-border/50">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 sm:px-6 flex items-center justify-between">
                <div className="flex items-start gap-4 w-full max-w-md">
                  <div className="w-5 h-5 bg-muted rounded-full flex-shrink-0 mt-0.5"></div>
                  <div className="flex-1 space-y-2">
                     <div className="h-4 bg-muted rounded w-full"></div>
                     <div className="h-3 bg-muted rounded w-24"></div>
                  </div>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-2">
                   <div className="h-5 bg-muted rounded w-12"></div>
                   <div className="h-3 bg-muted rounded w-20"></div>
                </div>
              </div>
            ))}
         </div>
      </div>

    </main>
  );
};

export default DashboardSkeleton;
