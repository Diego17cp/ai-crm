import { useEffect, useMemo, useState } from "react";
import { useClients } from "./useClients";
import type { Sexo, EstadoCivil, ApiError, TipoTelefono } from "@/core/types";
import type { CreateLeadPayload } from "@/features/leads/types";
import { toast } from "sonner";

interface PhoneUI {
	uiId: string;
	numero: string;
	tipo: TipoTelefono;
}

export const useCreateClient = (isOpen: boolean, onClose: () => void) => {
	const [numeroDoc, setNumeroDoc] = useState("");
	const [idTipoDoc, setIdTipoDoc] = useState("");
	const [nombres, setNombres] = useState("");
	const [apellidos, setApellidos] = useState("");
	const [email, setEmail] = useState("");
	const [fechaNacimiento, setFechaNacimiento] = useState("");
	const [direccion, setDireccion] = useState("");
	const [ocupacion, setOcupacion] = useState("");

	const [esPeruano, setEsPeruano] = useState<string>("true");
	const [nacionalidad, setNacionalidad] = useState<string>("");
	const [sexo, setSexo] = useState<string>("");
	const [estadoCivil, setEstadoCivil] = useState<string>("");
	const [idUbigeo, setIdUbigeo] = useState<string>("");

	const [phones, setPhones] = useState<PhoneUI[]>([]);
	const [error, setError] = useState<string | null>(null);

	const { useCreateClientMutation } = useClients();

	useEffect(() => {
		if (isOpen) {
			setNumeroDoc("");
			setNombres("");
			setApellidos("");
			setEmail("");
			setFechaNacimiento("");
			setDireccion("");
			setOcupacion("");
			setEsPeruano("true");
			setNacionalidad("");
			setSexo("");
			setEstadoCivil("");
			setIdUbigeo("");
			setPhones([]);
			setError(null);
		}
	}, [isOpen]);

	const createPayload = useMemo((): CreateLeadPayload => {
		return {
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
	}, [
		nombres,
		apellidos,
		numeroDoc,
		email,
		fechaNacimiento,
		esPeruano,
		direccion,
		ocupacion,
		sexo,
		estadoCivil,
		idUbigeo,
		phones,
		nacionalidad,
		idTipoDoc,
	]);

	const createClientMutation = useCreateClientMutation(createPayload);
	const isSubmitting = createClientMutation.isPending;

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

  const validateForm = () => {
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
      setError("La fecha de nacimiento no puede ser mayor a la fecha actual.");
      toast.error("La fecha de nacimiento no puede ser mayor a la fecha actual.");
      return false;
    }
    const edad = fechaActual.getFullYear() - fechaNacimientoDate.getFullYear();
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
  }

  const handleSubmit = async (e: React.SubmitEvent) => {
		e.preventDefault();
		setError(null);
		if (!validateForm()) return
		try {
			createClientMutation.mutate(undefined, {
				onSuccess: () => onClose(),
			});
		} catch (err: unknown) {
			const message =
				(err as ApiError)?.response?.data?.message ||
				"Error al crear el cliente.";
			setError(message);
      toast.error(message);
		}
	};

  return {
    numeroDoc,
    setNumeroDoc,
    idTipoDoc,
    setIdTipoDoc,
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
    error,
    isSubmitting,
    handleAddPhone,
    handleUpdatePhone,
    handleRemovePhone,
    handleSubmit,
  }
};
