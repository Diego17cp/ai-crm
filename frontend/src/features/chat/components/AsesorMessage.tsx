import ReactMarkdown from "react-markdown";
import { motion } from "motion/react";
import { FiUser } from "react-icons/fi";
import type { Chat } from "../types";

interface AsesorMessageProps {
    content: string;
    asesor: Chat["asesor"];
}

export const AsesorMessage = ({ content, asesor }: AsesorMessageProps) => {
    const asesorName = asesor ? `${asesor.nombres} ${asesor.apellidos?.split(" ")[0] || ""}` : "Asesor Especializado";
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex w-full mb-6 max-w-3xl"
        >
            <div className="shrink-0 mr-4 mt-1">
                <div className="size-10 rounded-full bg-blue-600 dark:bg-blue-700 flex items-center justify-center text-white shadow-sm border border-blue-500">
                    <FiUser size={24} />
                </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl rounded-tl-none p-4 shadow-sm border border-blue-100 dark:border-blue-800/50 w-full overflow-hidden">
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-1 block">
                    {asesorName}
                </span>
                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
                    <ReactMarkdown>
                        {content}
                    </ReactMarkdown>
                </div>
            </div>
        </motion.div>
    );
};