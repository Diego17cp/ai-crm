export const AppointmentListSkeleton = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col gap-4 animate-pulse">
                    <div className="flex justify-between items-start">
                        <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                        <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-full w-24" />
                    </div>
                    <div className="flex flex-col gap-3 mt-2">
                        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
                        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                    </div>
                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800/60">
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
};