export default function LoadingSpinner({ size = 'md', className = '' }) {
     const sizes = {
          sm: 'w-5 h-5 border-2',
          md: 'w-8 h-8 border-3',
          lg: 'w-12 h-12 border-4',
          xl: 'w-16 h-16 border-4',
     }

     return (
          <div className={`flex items-center justify-center ${className}`}>
               <div className={`${sizes[size]} border-surface-200 dark:border-surface-700 border-t-primary-500 rounded-full animate-spin`} />
          </div>
     )
}

export function PageLoader() {
     return (
          <div className="min-h-screen flex items-center justify-center">
               <div className="text-center space-y-4">
                    <LoadingSpinner size="xl" />
                    <p className="text-surface-500 dark:text-surface-400 text-sm animate-pulse">Loading...</p>
               </div>
          </div>
     )
}
