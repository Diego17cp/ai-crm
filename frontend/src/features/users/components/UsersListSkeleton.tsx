export const UsersListSkeleton = () => {
    return (
        <div className="flex flex-col gap-3 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                        <div className="flex items-center gap-4 w-full md:w-1/3">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full shrink-0"></div>
                            <div className="space-y-2 w-full">
                                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                                <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-800 rounded"></div>
                            </div>
                        </div>
                        <div className="space-y-2 w-full md:w-1/4">
                            <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded"></div>
                            <div className="h-3 w-1/3 bg-gray-200 dark:bg-gray-800 rounded"></div>
                        </div>
                        <div className="space-y-2 w-full md:w-1/4">
                            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0 justify-end">
                            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};