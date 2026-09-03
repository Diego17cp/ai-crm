interface TimelineItemProps {
	label: string;
	date: string | null;
	active: boolean;
}

export const TimelineItem = ({ label, date, active }: TimelineItemProps) => {
	return (
		<div className="relative min-w-0">
			<div className="flex items-center gap-1.5">
				<span
					className={`
            h-1.5 w-1.5 shrink-0 rounded-full
            ${
				active
					? "bg-current text-gray-700 dark:text-gray-200"
					: "bg-gray-200 text-gray-200 dark:bg-gray-700 dark:text-gray-700"
			}
          `}
				/>

				<span
					className={`
            truncate text-[10px] font-medium
            ${
				active
					? "text-gray-600 dark:text-gray-300"
					: "text-gray-400 dark:text-gray-600"
			}
          `}
				>
					{label}
				</span>
			</div>

			<span
				className={`
          mt-1 block truncate pl-3
          text-[10px]
          ${
				active
					? "text-gray-500 dark:text-gray-400"
					: "text-gray-300 dark:text-gray-600"
			}
        `}
			>
				{date ?? "Pendiente"}
			</span>
		</div>
	);
};
