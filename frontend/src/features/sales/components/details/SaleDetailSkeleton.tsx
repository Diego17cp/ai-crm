export const SaleDetailSkeleton = () => {
    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-pulse">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="space-y-3">
                    <div className="h-6 w-64 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    <div className="flex gap-2">
                        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                    </div>
                </div>
                <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="h-64 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"></div>
                    <div className="h-96 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"></div>
                </div>
                <div className="space-y-6">
                    <div className="h-80 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"></div>
                </div>
            </div>
        </div>
    );
};