export const LeadListSkeleton = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col gap-4 animate-pulse">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-800 shrink-0" />
                        <div className="flex flex-col gap-2 w-full">
                            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 mt-2">
                        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
                        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full" />
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800/60 flex gap-2">
                        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
                        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    );
};