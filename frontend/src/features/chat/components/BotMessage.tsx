import ReactMarkdown from "react-markdown";
import { motion } from "motion/react";
import { VscRobot } from "react-icons/vsc";

interface BotMessageProps {
	content: string;
}

export const BotMessage = ({ content }: BotMessageProps) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className="flex w-full mb-6 max-w-3xl"
		>
			<div className="shrink-0 mr-4 mt-1">
				<div className="size-10 rounded-full bg-teal-600 dark:bg-teal-700 flex items-center justify-center text-white">
					<VscRobot size={30} />
				</div>
			</div>
			<div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-none p-4 shadow-sm border border-gray-200 dark:border-gray-700 w-full overflow-hidden">
                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
                    <ReactMarkdown>
                        {content}
                    </ReactMarkdown>
                </div>
			</div>
		</motion.div>
	);
};
