export const CollectionSkeleton = () => {
    return (
        <div className="space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-6 justify-between">
                        <div className="space-y-3 w-1/4">
                            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
                            <div className="h-5 w-40 bg-gray-200 dark:bg-gray-800 rounded"></div>
                            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
                        </div>
                        <div className="space-y-3 w-1/4">
                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
                            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
                        </div>
                        <div className="space-y-3 w-1/4 text-right">
                            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded inline-block"></div>
                            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded ml-auto"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};