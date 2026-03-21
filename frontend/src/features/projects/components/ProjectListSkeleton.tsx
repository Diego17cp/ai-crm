export const ProjectListSkeleton = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 flex flex-col gap-4 animate-pulse">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex flex-col gap-2 flex-1">
                            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-md w-3/4"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-md w-1/2"></div>
                        </div>
                    </div>
                    <div className="space-y-2 mt-2">
                        <div className="h-3 bg-gray-100 dark:bg-gray-800/80 rounded-md w-full"></div>
                        <div className="h-3 bg-gray-100 dark:bg-gray-800/80 rounded-md w-4/5"></div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between">
                        <div className="flex gap-4">
                            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-md w-12"></div>
                            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-md w-12"></div>
                        </div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-md w-24 self-end"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}