import { motion } from "motion/react";
import { useState } from "react";
import type { IconType } from "react-icons";
import { IoMdCheckmark } from "react-icons/io";

interface CardCheckboxProps {
	value: boolean;
	onChange: (checked: boolean) => void;
	children?: React.ReactNode;
	icon?: IconType;
	title?: string;
	description?: string;
	disabled?: boolean;
	className?: string;
	compact?: boolean;
}

export const CardCheckbox = ({
	value,
	onChange,
	children,
	icon: Icon,
	title,
	description,
	disabled = false,
	className = "",
	compact = false,
}: CardCheckboxProps) => {
	const [isHovered, setIsHovered] = useState(false);

	const handleClick = () => {
		if (!disabled) {
			onChange(!value);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if ((e.key === "Enter" || e.key === " ") && !disabled) {
			e.preventDefault();
			onChange(!value);
		}
	};

	if (compact) {
		return (
			<motion.div
				role="checkbox"
				aria-checked={value}
				aria-disabled={disabled}
				tabIndex={disabled ? -1 : 0}
				onClick={handleClick}
				onKeyDown={handleKeyDown}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				whileTap={!disabled ? { scale: 0.98 } : {}}
				className={`
					relative flex min-h-14 items-center gap-3
					rounded-xl border
					px-3.5 py-3
					cursor-pointer
					transition-all duration-200

					${
						value
							? "border-teal-500 bg-teal-50 dark:border-teal-500 dark:bg-teal-900/20"
							: "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
					}

					${
						disabled
							? "cursor-not-allowed opacity-50"
							: "hover:border-teal-400 dark:hover:border-teal-600"
					}

					${className}
				`}
			>
				{Icon && (
					<div
						className={`
							flex h-9 w-9 shrink-0
							items-center justify-center
							rounded-lg
							transition-colors

							${
								value
									? "bg-teal-600 text-white dark:bg-teal-500"
									: "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
							}
						`}
					>
						<Icon size={18} />
					</div>
				)}

				<div className="min-w-0 flex-1">
					{title && (
						<p
							className={`
								text-sm font-semibold
								${
									value
										? "text-teal-700 dark:text-teal-400"
										: "text-gray-700 dark:text-gray-200"
								}
							`}
						>
							{title}
						</p>
					)}

					{description && (
						<p className="mt-0.5 truncate text-[11px] text-gray-500 dark:text-gray-400">
							{description}
						</p>
					)}
				</div>

				<div
					className={`
						flex h-5 w-5 shrink-0 items-center justify-center
						rounded-full border
						transition-all

						${
							value
								? "border-teal-600 bg-teal-600 dark:border-teal-500 dark:bg-teal-500"
								: "border-gray-300 dark:border-gray-600"
						}
					`}
				>
					{value && (
						<IoMdCheckmark className="h-3.5 w-3.5 text-white" />
					)}
				</div>

				<motion.div
					className="pointer-events-none absolute inset-0 rounded-xl bg-teal-500/5"
					initial={false}
					animate={{
						opacity:
							isHovered && !disabled && !value ? 1 : 0,
					}}
				/>
			</motion.div>
		);
	}

	// Tu variante grande actual...
	return (
		<motion.div
			className={`
          relative rounded-xl border-2 p-6 transition-all duration-200 ease-in-out cursor-pointer
          ${value
            ? "border-teal-600 bg-linear-to-br from-teal-600/5 to-teal-600/10 dark:from-teal-600/10 dark:to-teal-600/20"
            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          }
          ${disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:border-teal-600/50 hover:shadow-lg"
          }
          ${className}
      `}
			onClick={handleClick}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onKeyDown={handleKeyDown}
			tabIndex={disabled ? -1 : 0}
			role="checkbox"
			aria-checked={value}
			aria-disabled={disabled}
			whileHover={!disabled ? { y: -4 } : {}}
			whileTap={!disabled ? { scale: 0.98 } : {}}
		>
			<div className="flex flex-col items-center text-center">
				{children ? (
					children
				) : (
					<>
						{Icon && (
							<motion.div
								className={`
                    relative flex items-center justify-center w-20 h-20 rounded-2xl mb-4 transition-all duration-200 ease-in-out
                    ${
                      value
                        ? "bg-teal-600 dark:bg-teal-500 text-white shadow-lg shadow-teal-500/30"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    }
                  `}
								animate={{
									scale: value ? 1.05 : 1,
								}}
								transition={{ duration: 0.2 }}
							>
								<Icon className="w-10 h-10" />
								{value && (
									<motion.div
										className="absolute inset-0 rounded-2xl border-2 border-teal-600"
										initial={{ scale: 1, opacity: 1 }}
										animate={{
											scale: [1, 1.2, 1],
											opacity: [1, 0, 0],
										}}
										transition={{
											duration: 1.5,
											repeat: Infinity,
											ease: "easeOut",
										}}
									/>
								)}
							</motion.div>
						)}
						{title && (
							<h3
								className={`
                    text-lg font-bold mb-2 transition-colors duration-200 ease-in-out
                    ${value
                      ? "text-muni-primary"
                      : "text-gray-900 dark:text-gray-100"
                    }
                  `}
							>
								{title}
							</h3>
						)}
						{description && (
							<p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
								{description}
							</p>
						)}
					</>
				)}
			</div>
			<motion.div
				className="absolute inset-0 rounded-xl bg-teal-600/5 pointer-events-none"
				initial={false}
				animate={{
					opacity: isHovered && !disabled && !value ? 1 : 0,
				}}
				transition={{ duration: 0.2 }}
			/>
			{value && (
				<motion.div
					className="absolute inset-0 rounded-xl pointer-events-none"
					initial={false}
					animate={{
						boxShadow: [
							"0 0 0 0 rgba(2, 190, 109, 0)",
							"0 0 0 6px rgba(2, 190, 109, 0.15)",
							"0 0 0 0 rgba(2, 190, 109, 0)",
						],
					}}
					transition={{
						duration: 2,
						repeat: Infinity,
						ease: "easeInOut",
					}}
				/>
			)}
			{value && (
				<motion.div
					className="absolute top-3 right-3"
					initial={{ scale: 0, rotate: -180 }}
					animate={{ scale: 1, rotate: 0 }}
					transition={{
						type: "spring",
						stiffness: 300,
						damping: 20,
					}}
				>
					<div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center shadow-lg">
						<IoMdCheckmark className="w-4 h-4 text-white" />
					</div>
				</motion.div>
			)}
		</motion.div>
	);
};