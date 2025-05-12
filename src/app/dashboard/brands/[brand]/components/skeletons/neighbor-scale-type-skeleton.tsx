import { Skeleton } from "@/components/ui/skeleton";

export const NeighborScaleTypeSkeleton = () => {
  return (
    <div className="space-y-4">
      {/* Skeleton for ScaleWeights */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40" />
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        </div>
      </div>

      {/* Skeleton for similar brands */}
      <div className="mt-6">
        <Skeleton className="h-6 w-40 mb-4" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 h-32">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-5 w-32" />
                <div className="flex items-center space-x-1">
                  {[...Array(3)].map((_, j) => (
                    <Skeleton key={j} className="h-2.5 w-2.5 rounded-full" />
                  ))}
                  <Skeleton className="h-5 w-10 ml-2" />
                </div>
              </div>
              
              <div className="flex justify-between mb-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
              
              <div className="border-t border-gray-100 pt-3">
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};