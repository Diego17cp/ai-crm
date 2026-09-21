import { useEffect, useMemo, useState } from "react";
import { useAppointments } from "./useAppointments";
import { toast } from "sonner";
import type { ApiError, EstadoCivil, Sexo, TipoTelefono } from "@/core/types";
import type { CreateAppointmentPayload } from "../types";
import { useAuthStore } from "@/features/auth";

interface PhoneUI {
	uiId: string;
	numero: string
	tipo: TipoTelefono;
}

export const useCreateAppointment = (isOpen: boolean, onClose: () => void) => {
	const { user } = useAuthStore();

	const [step, setStep] = useState<1 | 2>(1);
	const [idProyecto, setIdProyecto] = useState("");
	const [idEtapa, setIdEtapa] = useState("");
	const [idManzana, setIdManzana] = useState("");
	const [idLote, setIdLote] = useState("");
	const [fechaCita, setFechaCita] = useState("");
	const [horaCita, setHoraCita] = useState("");
	const [observaciones, setObservaciones] = useState("");

	const [clientMode, setClientMode] = useState<
		"existing_client" | "new_lead" | "existing_lead"
	>("existing_client");
	const [selectedClientId, setSelectedClientId] = useState<number | null>(
		null,
	);
	const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);

	const [idTipoDoc, setIdTipoDoc] = useState<string>("");
	const [numeroDoc, setNumeroDoc] = useState("");
	const [nombres, setNombres] = useState("");
	const [apellidos, setApellidos] = useState("");
	const [email, setEmail] = useState("");
	const [fechaNacimiento, setFechaNacimiento] = useState("");
	const [direccion, setDireccion] = useState("");
	const [ocupacion, setOcupacion] = useState("");

	const [esPeruano, setEsPeruano] = useState<string>("true");
	const [nacionalidad, setNacionalidad] = useState("");
	const [sexo, setSexo] = useState<string>("");
	const [estadoCivil, setEstadoCivil] = useState<string>("");
	const [idUbigeo, setIdUbigeo] = useState<string>("");

	const [phones, setPhones] = useState<PhoneUI[]>([]);
	const [error, setError] = useState<string | null>(null);

	const { useCreateAppointmentMutation } = useAppointments();

	useEffect(() => {
		if (isOpen) {
			setStep(1);
			setIdProyecto("");
			setIdEtapa("");
			setIdManzana("");
			setIdLote("");
			setFechaCita("");
			setHoraCita("");
			setObservaciones("");

			setClientMode("existing_client");
			setSelectedClientId(null);

			setNumeroDoc("");
			setNombres("");
			setApellidos("");
			setEmail("");
			setFechaNacimiento("");
			setDireccion("");
			setOcupacion("");
			setEsPeruano("true");
			setSexo("");
			setEstadoCivil("");
			setIdUbigeo("");
			setPhones([]);
			setError(null);
		}
	}, [isOpen]);

	const handleAddPhone = () => {
		setPhones([
			...phones,
			{ uiId: crypto.randomUUID(), numero: "", tipo: "PERSONAL" },
		]);
	};
	const handleUpdatePhone = (
		uiId: string,
		field: "numero" | "tipo",
		value: string,
	) => {
		setPhones((prev) =>
			prev.map((p) => (p.uiId === uiId ? { ...p, [field]: value } : p)),
		);
	};
	const handleRemovePhone = (uiId: string) => {
		setPhones((prev) => prev.filter((p) => p.uiId !== uiId));
	};

	const leadFieldsState = {
		idTipoDoc,
		numeroDoc,
		nombres,
		apellidos,
		email,
		fechaNacimiento,
		esPeruano,
		phones,
		nacionalidad,
		sexo,
		idUbigeo,
		direccion,
		ocupacion,
		estadoCivil,
	};

	const handleFieldChange = (field: string, value: string) => {
		const setters: Record<string, (val: string) => void> = {
			idTipoDoc: setIdTipoDoc,
			numeroDoc: setNumeroDoc,
			nombres: setNombres,
			apellidos: setApellidos,
			email: setEmail,
			fechaNacimiento: setFechaNacimiento,
			esPeruano: setEsPeruano,
			nacionalidad: setNacionalidad,
			sexo: setSexo,
			idUbigeo: setIdUbigeo,
			direccion: setDireccion,
			ocupacion: setOcupacion,
			estadoCivil: setEstadoCivil,
		};
		setters[field]?.(value);
	};

	const createPayload = useMemo((): CreateAppointmentPayload => {
		const payload: CreateAppointmentPayload = {
			id_proyecto: Number(idProyecto),
			id_lote: idLote ? Number(idLote) : null,
			id_usuario_responsable: user?.id || "",
			fecha_cita: fechaCita,
			hora_cita: horaCita,
			observaciones_visita: observaciones.trim() || undefined,
		};

		if (clientMode === "existing_client" && selectedClientId) {
			payload.id_cliente = selectedClientId;
		} else if (clientMode === "existing_lead" && selectedLeadId) {
			payload.id_lead = selectedLeadId;
		} else if (clientMode === "new_lead") {
			payload.nuevo_lead = {
				id_tipo_doc_identidad: Number(idTipoDoc),
				nombres: nombres.trim() || undefined,
				apellidos: apellidos.trim() || undefined,
				numero: numeroDoc.trim(),
				email: email.trim() || undefined,
				fecha_nacimiento: fechaNacimiento || undefined,
				es_peruano: esPeruano === "true",
				nacionalidad: nacionalidad.trim() || undefined,
				direccion: direccion.trim() || undefined,
				ocupacion: ocupacion.trim() || undefined,
				sexo: (sexo as Sexo) || undefined,
				estado_civil: (estadoCivil as EstadoCivil) || undefined,
				id_ubigeo: idUbigeo || undefined,
				telefonos: phones
					.filter((p) => p.numero.trim())
					.map((p) => ({ numero: p.numero.trim(), tipo: p.tipo })),
			};
		}

		return payload;
	}, [
		idProyecto,
		idLote,
		fechaCita,
		horaCita,
		observaciones,
		clientMode,
		selectedClientId,
		numeroDoc,
		nombres,
		apellidos,
		email,
		fechaNacimiento,
		esPeruano,
		direccion,
		ocupacion,
		sexo,
		estadoCivil,
		idUbigeo,
		phones,
		idTipoDoc,
		nacionalidad,
		selectedLeadId,
	]);

	const mutation = useCreateAppointmentMutation(createPayload);
	const isSubmitting = mutation.isPending;

	const handleNextStep = () => {
		setError(null);
		if (!idProyecto) {
			toast.error("Debes seleccionar un proyecto.");
			return setError("Debes seleccionar un proyecto.");
		}
		if (!fechaCita) {
			toast.error("La fecha de la cita es obligatoria.");
			return setError("La fecha de la cita es obligatoria.");
		}
		if (!horaCita) {
			toast.error("La hora de la cita es obligatoria.");
			return setError("La hora de la cita es obligatoria.");
		}
		setStep(2);
	};

	const validateNewLeadForm = () => {
		if (!idTipoDoc || !Number(idTipoDoc)) {
			setError("El tipo de documento es requerido.");
			toast.error("El tipo de documento es requerido.");
			return false;
		}
		if (!numeroDoc.trim()) {
			setError("El número de documento es requerido.");
			toast.error("El número de documento es requerido.");
			return false;
		}

		if (!nombres.trim()) {
			setError("Los nombres son requeridos.");
			toast.error("Los nombres son requeridos.");
			return false;
		}

		if (!apellidos.trim()) {
			setError("Los apellidos son requeridos.");
			toast.error("Los apellidos son requeridos.");
			return false;
		}

		if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(nombres.trim())) {
			toast.error("Los nombres no deben contener números.");
			setError("Los nombres no deben contener números.");
			return false;
		}
		if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(apellidos.trim())) {
			setError("Los apellidos no deben contener números.");
			toast.error("Los apellidos no deben contener números.");
			return false;
		}
		if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
			setError("El correo electrónico no es válido.");
			toast.error("El correo electrónico no es válido.");
			return false;
		}
		const fechaNacimientoDate = new Date(fechaNacimiento);
		const fechaActual = new Date();
		if (fechaNacimientoDate > fechaActual) {
			setError(
				"La fecha de nacimiento no puede ser mayor a la fecha actual.",
			);
			toast.error(
				"La fecha de nacimiento no puede ser mayor a la fecha actual.",
			);
			return false;
		}
		const edad =
			fechaActual.getFullYear() - fechaNacimientoDate.getFullYear();
		if (edad < 18) {
			setError("El lead debe ser mayor de edad.");
			toast.error("El lead debe ser mayor de edad.");
			return false;
		}
		if (phones.length === 0) {
			setError("Debe agregar al menos un teléfono.");
			toast.error("Debe agregar al menos un teléfono.");
			return false;
		}
		if (!/^[0-9]+$/.test(phones[0].numero.trim())) {
			setError("El teléfono debe ser solo números.");
			toast.error("El teléfono debe ser solo números.");
			return false;
		}
		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (clientMode === "existing_client" && !selectedClientId) {
			toast.error(
				"Debes buscar y seleccionar un cliente existente de la agenda.",
			);
			return setError(
				"Debes buscar y seleccionar un cliente existente de la agenda.",
			);
		}
		if (clientMode === "existing_lead" && !selectedLeadId) {
			toast.error("Debes buscar y seleccionar un lead existente.");
			return setError("Debes buscar y seleccionar un lead existente.");
		}

		if (clientMode === "new_lead") {
			const isValid = validateNewLeadForm();
			if (!isValid) return;
		}

		try {
			mutation.mutate(undefined, {
				onSuccess: () => onClose(),
			});
		} catch (err: unknown) {
			toast.error(
				(err as ApiError)?.response?.data?.message ||
					"Error al crear la cita.",
			);
			setError(
				(err as ApiError)?.response?.data?.message ||
					"Error al crear la cita.",
			);
		}
	};

	return {
		step,
		setStep,
		idProyecto,
		setIdProyecto,
		idEtapa,
		setIdEtapa,
		idManzana,
		setIdManzana,
		idLote,
		setIdLote,
		fechaCita,
		setFechaCita,
		horaCita,
		setHoraCita,
		observaciones,
		setObservaciones,
		clientMode,
		setClientMode,
		selectedClientId,
		setSelectedClientId,
		selectedLeadId,
		setSelectedLeadId,
		idTipoDoc,
		setIdTipoDoc,
		numeroDoc,
		setNumeroDoc,
		nombres,
		setNombres,
		apellidos,
		setApellidos,
		email,
		setEmail,
		fechaNacimiento,
		setFechaNacimiento,
		direccion,
		setDireccion,
		ocupacion,
		setOcupacion,
		esPeruano,
		setEsPeruano,
		nacionalidad,
		setNacionalidad,
		sexo,
		setSexo,
		estadoCivil,
		setEstadoCivil,
		idUbigeo,
		setIdUbigeo,
		phones,
		setPhones,
		error,
		setError,
		useCreateAppointmentMutation,
		handleAddPhone,
		handleUpdatePhone,
		handleRemovePhone,
		createPayload,
		handleNextStep,
		handleSubmit,
		handleFieldChange,
		leadFieldsState,

		isSubmitting,
	};
};
