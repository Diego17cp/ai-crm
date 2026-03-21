import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiX, FiEdit, FiAlertCircle } from "react-icons/fi";
import { BiLoaderAlt } from "react-icons/bi";
import { useProjects } from "../hooks/useProjects";
import { useUbigeos } from "@/core/hooks/useUbigeos";
import type { ApiError } from "@/core/types";
import type { Proyecto } from "../types";
import { SearchableSelect } from "dialca-ui";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    project: Proyecto | null;
}

export const EditProjectModal = ({ isOpen, onClose, project }: Props) => {
    const [nombre, setNombre] = useState("");
    const [abreviatura, setAbreviatura] = useState("");
    const [ubicacion, setUbicacion] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [idUbigeo, setIdUbigeo] = useState<string>("");
    
    const [error, setError] = useState<string | null>(null);

    const { ubigeosQuery } = useUbigeos();
    const { useEditProjectMutation } = useProjects();
    
    const editProjectMutation = useEditProjectMutation(
        project?.id || 0,
        idUbigeo, 
        nombre, 
        abreviatura, 
        ubicacion, 
        descripcion
    );
    
    const isSubmitting = editProjectMutation.isPending;

    useEffect(() => {
        if (isOpen && project) {
            setNombre(project.nombre || "");
            setAbreviatura(project.abreviatura || "");
            setUbicacion(project.ubicacion || "");
            setDescripcion(project.descripcion || "");
            setIdUbigeo(String(project.id_ubigeo || ""));
            setError(null);
        }
    }, [isOpen, project]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen && !isSubmitting) onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose, isSubmitting]);

    const ubigeoOptions = ubigeosQuery.data?.map((u: {
        id: string;
        nombre: string;
    }) => ({
        value: String(u.id),
        label: `${u.id} - ${u.nombre}` 
    })) || [];

    if (!project) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const trimmedNombre = nombre.trim();
        if (!trimmedNombre) {
            setError("El nombre del proyecto es obligatorio.");
            return;
        }
        if (!idUbigeo) {
            setError("Debes seleccionar un ubigeo válido.");
            return;
        }
        try {
            editProjectMutation.mutate();
            onClose();
        } catch (err: unknown) {
            const message = (err as ApiError)?.response?.data?.message || "Error al editar el proyecto.";
            setError(message);
        }
    };

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
                            className="bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl pointer-events-auto border border-gray-100 dark:border-gray-800 overflow-hidden"
                        >
                            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded-xl">
                                        <FiEdit size={20} />
                                    </div>
                                    <div className="flex flex-col">
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                            Editar Proyecto
                                        </h2>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Actualiza los datos del inmueble
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
                                <div className="p-6 flex-1 overflow-y-auto main-scrollbar flex flex-col gap-5">
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                                                Nombre <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={nombre}
                                                onChange={(e) => { setNombre(e.target.value); setError(null); }}
                                                disabled={isSubmitting}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all disabled:opacity-60"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                                                Abreviatura
                                            </label>
                                            <input
                                                type="text"
                                                value={abreviatura}
                                                onChange={(e) => setAbreviatura(e.target.value)}
                                                disabled={isSubmitting}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all disabled:opacity-60 uppercase"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5 z-50 md:col-span-2">
                                            {ubigeosQuery.isLoading ? (
                                                <div className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 animate-pulse">
                                                    Cargando ubigeos...
                                                </div>
                                            ): ubigeosQuery.isError ? (
                                                <div className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-red-500">
                                                    Error al cargar ubigeos
                                                    </div>
                                            ) : (
                                                <SearchableSelect 
                                                    options={ubigeoOptions}
                                                    value={idUbigeo}
                                                    onChange={(val) => { setIdUbigeo(val); setError(null); }}
                                                    placeholder="Buscar distrito, provincia..."
                                                    label="Ubigeo"
                                                    required
                                                    disabled={isSubmitting || ubigeosQuery.isError}
                                                    isClearable
                                                    classes={{
                                                        label: "dark:text-gray-300! text-gray-700!",
                                                        input: "bg-gray-50! dark:bg-gray-800/50! border-gray-200! dark:border-gray-700! focus:border-teal-500! focus:ring-teal-500/20! text-gray-900! dark:text-white! focus:outline-none! focus:ring-2! rounded-xl! disabled:opacity-60!",
                                                        option: "hover:bg-teal-500/10! dark:bg-gray-800! hover:text-gray-900! dark:hover:text-white! dark:hover:bg-teal-500/40!",
                                                        dropdown: "dark:bg-gray-800! dark:border-gray-700! main-scrollbar!",
                                                        clearButton: "dark:text-gray-400! dark:hover:text-gray-200!"
                                                    }}
                                                />
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-1.5 md:col-span-2 xl:col-span-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                                                Ubicación
                                            </label>
                                            <input
                                                type="text"
                                                value={ubicacion}
                                                onChange={(e) => setUbicacion(e.target.value)}
                                                disabled={isSubmitting}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all disabled:opacity-60"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1.5 md:col-span-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                                                Descripción
                                            </label>
                                            <textarea
                                                value={descripcion}
                                                onChange={(e) => setDescripcion(e.target.value)}
                                                disabled={isSubmitting}
                                                rows={3}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:border-teal-500 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all disabled:opacity-60 resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 pt-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 shrink-0">
                                    <div className="flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            disabled={isSubmitting}
                                            className="px-6 cursor-pointer py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-colors disabled:opacity-50"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-8 cursor-pointer py-3 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold rounded-xl shadow-md shadow-teal-500/20 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? (
                                                <><BiLoaderAlt className="animate-spin text-lg" /><span>Guardando...</span></>
                                            ) : (
                                                "Guardar Cambios"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};