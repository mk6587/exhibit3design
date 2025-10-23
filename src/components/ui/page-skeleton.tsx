import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header Skeleton */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Skeleton className="h-8 w-32" />
            <div className="hidden md:flex gap-6">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>

      {/* Hero Section Skeleton */}
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <Skeleton className="h-12 w-3/4 mx-auto" />
            <Skeleton className="h-12 w-2/3 mx-auto" />
            <Skeleton className="h-6 w-4/5 mx-auto" />
            <Skeleton className="h-6 w-3/4 mx-auto" />
            <div className="flex gap-4 justify-center pt-4">
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-12 w-40" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid Skeleton */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      </div>

      {/* Additional Content Skeleton */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
