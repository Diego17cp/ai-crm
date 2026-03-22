export const LotListSkeleton = () => {
    const skeletons = Array.from({ length: 8 });

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {skeletons.map((_, idx) => (
                <div 
                    key={idx} 
                    className="flex flex-col bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden animate-pulse"
                >
                    <div className="h-40 bg-gray-200 dark:bg-gray-800 w-full" />                    
                    <div className="p-5 flex flex-col gap-4">
                        <div>
                            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-md w-1/2 mb-2" />
                            <div className="h-3 bg-gray-100 dark:bg-gray-800/50 rounded-md w-1/3" />
                        </div>
                        
                        <div className="space-y-3 mt-2">
                            <div className="flex gap-2 items-center">
                                <div className="w-7 h-7 bg-gray-200 dark:bg-gray-800 rounded-lg shrink-0" />
                                <div className="flex flex-col gap-1 w-full">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-md w-3/4" />
                                    <div className="h-3 bg-gray-100 dark:bg-gray-800/50 rounded-md w-1/2" />
                                </div>
                            </div>
                            <div className="flex gap-2 items-center">
                                <div className="w-7 h-7 bg-gray-200 dark:bg-gray-800 rounded-lg shrink-0" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-md w-1/3" />
                            </div>
                            <div className="flex gap-2 items-center">
                                <div className="w-7 h-7 bg-gray-200 dark:bg-gray-800 rounded-lg shrink-0" />
                                <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-md w-1/2" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};