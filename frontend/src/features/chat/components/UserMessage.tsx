import { motion } from "motion/react";
import { RiUser3Fill } from "react-icons/ri";

interface UserMessageProps {
	content: string;
}

export const UserMessage = ({ content }: UserMessageProps) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className="flex justify-end w-full mb-6"
		>
			<div className="bg-teal-600 dark:bg-teal-700 text-white rounded-2xl rounded-tr-none px-5 py-3 shadow-md max-w-2xl">
				<p className="whitespace-pre-wrap text-sm md:text-base">
					{content}
				</p>
			</div>
			<div className="shrink-0 ml-4 mt-1">
				<div className="size-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300">
					<RiUser3Fill size={25} />
				</div>
			</div>
		</motion.div>
	);
};
