import { useState } from "react";
import type { CreateUserPayload } from "../types";
import { useUsers } from "./useUsers";
import { toast } from "sonner";

export const useCreateUser = (onClose: () => void) => {
	const { useCreateUserMutation } = useUsers();

	const [formData, setFormData] = useState<CreateUserPayload>({
		nombres: "",
		apellidos: "",
		dni: "",
		email: "",
		telefono: "",
		id_rol: 0,
		password_plain: "",
	});

	const mutation = useCreateUserMutation(formData);

	const validateForm = () => {
		if (!formData.id_rol) {
			toast.error("El rol es requerido.");
			return false;
		}
		if (!formData.dni.trim()) {
			toast.error("El DNI es requerido.");
			return false;
		}
		if (formData.dni.length !== 8 || !/^[0-9]+$/.test(formData.dni)) {
			toast.error("El DNI debe tener 8 dígitos.");
			return false;
		}

		if (!formData.nombres.trim()) {
			toast.error("Los nombres son requeridos.");
			return false;
		}

		if (!formData.apellidos.trim()) {
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
			formData.email.trim() &&
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
		if (!formData.password_plain.trim()) {
			toast.error("La contraseña es requerida.");
			return false;
		}
		if (formData.password_plain.length < 8) {
			toast.error("La contraseña debe tener al menos 8 caracteres.");
			return false;
		}
		return true;
	};

	const handleSubmit = (e: React.SubmitEvent) => {
		e.preventDefault();
		if (!validateForm()) return;
		mutation.mutate(undefined, {
			onSuccess: () => {
				onClose();
				setFormData({
					nombres: "",
					apellidos: "",
					dni: "",
					email: "",
					telefono: "",
					id_rol: 0,
					password_plain: "",
				});
			},
		});
	};

	return {
		mutation,
		formData,
		setFormData,
		handleSubmit,
		validateForm,
	};
};
