import { useState, useEffect } from "react";
import type { UpdateUserPayload, User } from "../types";
import { useUsers } from "./useUsers";
import { toast } from "sonner";

export const useEditUser = (user: User | null, onClose: () => void, isOpen: boolean) => {
	const { useUpdateUserMutation } = useUsers();

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

  const validateForm = () => {
		if (!formData.id_rol) {
			toast.error("El rol es requerido.");
			return false;
		}
		if (!formData.dni?.trim()) {
			toast.error("El DNI es requerido.");
			return false;
		}
		if (formData.dni.length !== 8 || !/^[0-9]+$/.test(formData.dni)) {
			toast.error("El DNI debe tener 8 dígitos.");
			return false;
		}

		if (!formData.nombres?.trim()) {
			toast.error("Los nombres son requeridos.");
			return false;
		}

		if (!formData.apellidos?.trim()) {
			toast.error("Los apellidos son requeridos.");
			return false;
		}

		if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(formData.nombres.trim())) {
			toast.error("Los nombres no deben contener números.");
			return false;
		}
		if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(formData.apellidos.trim())) {
			toast.error("Los apellidos no deben contener números.");
			return false;
		}
		if (
			formData.email?.trim() &&
			!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
		) {
			toast.error("El correo electrónico no es válido.");
			return false;
		}
		if (formData.telefono && !/^[0-9]+$/.test(formData.telefono.trim())) {
			toast.error("El teléfono debe ser solo números.");
			return false;
		}
		if (
			formData.telefono &&
			(formData.telefono.length !== 9 ||
				!/^[0-9]+$/.test(formData.telefono))
		) {
			toast.error("El teléfono debe tener 9 dígitos.");
			return false;
		}
		return true;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
    if (!validateForm()) return;
		if (!mutation) return;

		mutation.mutate(undefined, {
			onSuccess: () => {
				onClose();
			},
		});
	};

  return {
    mutation,
    formData,
    setFormData,
    handleSubmit,
    validateForm,
  }
};
