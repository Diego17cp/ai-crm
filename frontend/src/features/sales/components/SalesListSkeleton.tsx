export const SalesListSkeleton = () => (
	<div className="flex flex-col gap-3">
		{[1, 2, 3, 4].map((i) => (
			<div
				key={i}
				className="h-28 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse w-full"
			/>
		))}
	</div>
);
