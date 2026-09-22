import ReactMarkdown from "react-markdown";
import { motion } from "motion/react";
import { VscRobot } from "react-icons/vsc";
import type { ToolAttachment } from "@/shared/types/attachment";
import { AttachmentCard } from "./AttachmentCard";

interface BotMessageProps {
	content: string;
	attachments?: ToolAttachment[];
}

export const BotMessage = ({ content, attachments }: BotMessageProps) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className="flex w-full mb-6 max-w-3xl"
		>
			<div className="shrink-0 mr-4 mt-1">
				<div className="size-10 rounded-full bg-pink-600 dark:bg-pink-700 flex items-center justify-center text-white">
					<VscRobot size={30} />
				</div>
			</div>
			<div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-none p-4 shadow-sm border border-gray-200 dark:border-gray-700 w-full overflow-hidden">
				<div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
					<ReactMarkdown>{content}</ReactMarkdown>
				</div>
				{attachments && attachments.length > 0 && (
					<div className="grid grid-cols-1 sm:grid-cols-2  gap-2 px-4 pb-4 pt-3 border-t border-gray-200/70 dark:border-gray-700/70">
						{attachments.map((att, i) => (
							<AttachmentCard key={i} attachment={att} />
						))}
					</div>
				)}
			</div>
		</motion.div>
	);
};
