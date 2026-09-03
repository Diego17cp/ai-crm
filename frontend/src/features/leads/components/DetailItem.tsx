interface DetailItemProps {
	icon?: React.ReactNode;
	label: string;
	value: string | null | undefined;
}

export const DetailItem = ({ icon, label, value }: DetailItemProps) => {
	return (
		<div className="min-w-0">
			<div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-gray-400">
				{icon}
				{label}
			</div>

			<p
				className={`
          mt-1 truncate text-sm
          ${
				value
					? "text-gray-700 dark:text-gray-300"
					: "text-gray-400 dark:text-gray-600"
			}
        `}
				title={value ?? undefined}
			>
				{value ?? "No especificado"}
			</p>
		</div>
	);
};