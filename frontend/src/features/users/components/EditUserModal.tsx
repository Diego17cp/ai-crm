import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FiX, FiEdit2, FiMail, FiPhone, FiCreditCard } from "react-icons/fi";
import { useUsers } from "../hooks/useUsers";
import { useRoles } from "@/features/roles/hooks/useRoles";
import type { UpdateUserPayload, User } from "../types";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

export const EditUserModal = ({ isOpen, onClose, user }: Props) => {
    const { useUpdateUserMutation } = useUsers();
    const { roles } = useRoles();
    
    const [formData, setFormData] = useState<UpdateUserPayload>({});

    const mutation = useUpdateUserMutation(user?.id || "", formData);

    useEffect(() => {
        if (user && isOpen) {
            setFormData({
                nombres: user.nombres,
                apellidos: user.apellidos,
                dni: user.dni,
                email: user.email,
                telefono: user.telefono || undefined,
                id_rol: user.rol.id,
                estado: user.estado,
            });
        }
    }, [user, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!mutation) return;
        
        mutation.mutate(undefined, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    if (!user) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 transition-opacity"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 rounded-lg">
                                    <FiEdit2 size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Editar Usuario</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Actualiza los datos de {user.nombres}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                            >
                                <FiX size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
                            <div className="p-6 overflow-y-auto main-scrollbar space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Nombres
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.nombres || ""}
                                            onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-blue-500 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Apellidos
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.apellidos || ""}
                                            onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-blue-500 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Documento (DNI)
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <FiCreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                required
                                                type="text"
                                                maxLength={8}
                                                value={formData.dni || ""}
                                                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-blue-500 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Correo Electrónico
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                required
                                                type="email"
                                                value={formData.email || ""}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-blue-500 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Teléfono
                                        </label>
                                        <div className="relative">
                                            <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                minLength={9}
                                                maxLength={11}
                                                type="tel"
                                                value={formData.telefono || ""}
                                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-blue-500 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado de Acceso</label>
                                        <select
                                            value={formData.estado || "ACTIVO"}
                                            onChange={(e) => setFormData({ ...formData, estado: e.target.value as "ACTIVO" | "INACTIVO" })}
                                            className="w-full cursor-pointer px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-blue-500 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors appearance-none scheme-light dark:scheme-dark"
                                        >
                                            <option value="ACTIVO">Activo (Permitir Acceso)</option>
                                            <option value="INACTIVO">Inactivo (Bloquear)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Rol del Sistema
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            required
                                            value={formData.id_rol || ""}
                                            onChange={(e) => setFormData({ ...formData, id_rol: Number(e.target.value) })}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-blue-500 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors appearance-none"
                                        >
                                            <option value="" disabled>Selecciona un rol</option>
                                            {roles.map(rol => (
                                                <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 flex justify-end gap-3 mt-auto shrink-0">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-5 py-2.5 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={mutation?.isPending}
                                    className="flex cursor-pointer items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-blue-500/30"
                                >
                                    {mutation?.isPending ? "Guardando..." : "Guardar Cambios"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};