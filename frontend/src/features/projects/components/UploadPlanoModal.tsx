import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiX, FiUpload, FiAlertCircle, FiFileText, FiDownload, FiCheck } from "react-icons/fi";
import { BiLoaderAlt } from "react-icons/bi";
import { DropZone } from "dialca-ui";
import { useProjects } from "../hooks/useProjects";
import type { ApiError } from "@/core/types";
import type { Proyecto } from "../types";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    project: Proyecto | null;
}

export const UploadPlanoModal = ({ isOpen, onClose, project }: Props) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { useUploadPlanoMutation } = useProjects();
    const uploadMutation = useUploadPlanoMutation(project?.id || 0, file as File);
    const isSubmitting = uploadMutation.isPending;

    useEffect(() => {
        if (isOpen) {
            setFile(null);
            setError(null);
            setIsDragging(false);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen && !isSubmitting) onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose, isSubmitting]);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        setError(null);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === "application/pdf") setFile(droppedFile);
            else setError("Por favor, sube un archivo en formato PDF.");
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type === "application/pdf") setFile(selectedFile);
            else setError("Por favor, sube un archivo en formato PDF.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError("Debe seleccionar un archivo PDF para subir.");
            return;
        }
        try {
            uploadMutation.mutate();
            onClose();
        } catch (err: unknown) {
            const message = (err as ApiError)?.response?.data?.message || "Error al subir el plano.";
            setError(message);
        }
    };

    if (!project) return null;

    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "";
    const pdfUrl = project.plano_url ? `${baseUrl}/uploads/planos/${project.plano_url}` : "";

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-110"
                        onClick={() => !isSubmitting && onClose()}
                    />
                    <div className="fixed inset-0 z-115 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="bg-white dark:bg-gray-900 w-full max-w-lg flex flex-col rounded-3xl shadow-2xl pointer-events-auto border border-gray-100 dark:border-gray-800 overflow-hidden"
                        >
                            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded-xl">
                                        <FiUpload size={20} />
                                    </div>
                                    <div className="flex flex-col">
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                            Subir Plano PDF
                                        </h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-62.5 truncate">
                                            {project.nombre}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    className="p-2 cursor-pointer bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 rounded-full transition-colors disabled:opacity-50"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
                                <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-5">
                                    <AnimatePresence>
                                        {error && (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                                className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm overflow-hidden"
                                            >
                                                <FiAlertCircle className="shrink-0" /><span>{error}</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    {project.plano_url && (
                                        <div className="flex flex-col gap-3 p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl">
                                            <div className="flex items-start gap-3 text-orange-700 dark:text-orange-400">
                                                <FiAlertCircle className="size-5 shrink-0 mt-0.5" />
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-sm font-medium leading-tight">Plano actual existente</p>
                                                    <p className="text-xs opacity-80">
                                                        Este proyecto ya cuenta con un plano. Al subir uno nuevo, <b>reemplazará</b> automáticamente al actual.
                                                    </p>
                                                </div>
                                            </div>
                                            <a 
                                                href={pdfUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center justify-between p-3 mt-1 bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-800/50 rounded-xl hover:border-orange-400 dark:hover:border-orange-500 transition-colors group cursor-pointer"
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg shrink-0">
                                                        <FiFileText size={18} />
                                                    </div>
                                                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate">
                                                        Ver plano actual
                                                    </span>
                                                </div>
                                                <FiDownload size={18} className="text-gray-400 group-hover:text-orange-500 mr-1 shrink-0" />
                                            </a>
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-1.5 flex-1 mt-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                                            Seleccionar archivo PDF
                                        </label>
                                        
                                        <input 
                                            type="file" 
                                            ref={inputRef} 
                                            onChange={handleFileSelect} 
                                            accept="application/pdf"
                                            className="hidden"
                                        />
                                        
                                        {!file ? (
                                            <div className="flex-1 min-h-42.5">
                                                <DropZone
                                                    isDragging={isDragging}
                                                    onDragOver={handleDragOver}
                                                    onDragLeave={handleDragLeave}
                                                    onDrop={handleDrop}
                                                    onClick={() => inputRef.current?.click()}
                                                    icon={<FiUpload size={32} className="mb-2 text-gray-400 dark:text-gray-500" />}
                                                    title={
                                                        <p className="font-semibold text-gray-700 dark:text-gray-300">
                                                            Sube tu plano aquí
                                                        </p>
                                                    }
                                                    description="Arrastra y suelta un archivo PDF, o haz clic para seleccionar."
                                                    classes={{
                                                        container: ` ${
                                                            isDragging 
                                                            ? 'border-teal-500! bg-teal-50! dark:bg-teal-900/20!' 
                                                            : 'border-gray-300 dark:bg-gray-800! dark:border-gray-700! hover:border-teal-500! hover:bg-gray-50 dark:hover:bg-gray-800/50!'
                                                        }`
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between p-4 border border-teal-200 dark:border-teal-900/50 bg-teal-50 dark:bg-teal-900/10 rounded-2xl">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="p-2.5 bg-white dark:bg-gray-800 text-teal-600 dark:text-teal-400 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 shrink-0">
                                                        <FiFileText size={20} />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                                            {file.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    disabled={isSubmitting}
                                                    onClick={() => { setFile(null); if (inputRef.current) inputRef.current.value = ""; }}
                                                    className="p-2 cursor-pointer hover:bg-white dark:hover:bg-gray-800 text-gray-400 hover:text-red-500 rounded-full transition-colors shrink-0"
                                                >
                                                    <FiX size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-end gap-3 shrink-0">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={isSubmitting}
                                        className="px-5 py-2.5 cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors disabled:opacity-50 outline-none"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !file}
                                        className="flex items-center cursor-pointer gap-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm shadow-teal-500/30 transition-all focus:ring-2 focus:ring-teal-500 focus:outline-none disabled:opacity-50 disabled:shadow-none"
                                    >
                                        {isSubmitting ? (
                                            <><BiLoaderAlt className="animate-spin" size={18} /><span>Subiendo...</span></>
                                        ) : (
                                            <><FiCheck size={18} /><span>Guardar Plano</span></>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};