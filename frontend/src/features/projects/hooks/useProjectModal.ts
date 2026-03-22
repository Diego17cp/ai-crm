import { useState } from "react";
import type { Etapa, Manzana, Proyecto } from "../types";

export type ProjectModalType =
	| "none"
	| "details"
	| "create_project"
	| "create_etapa"
	| "create_manzana"
    | "edit_project"
    | "toggle_project_status"
    | "edit_etapa"
    | "toggle_etapa_status"
    | "edit_manzana"
    | "toggle_manzana_status";

export const useProjectModals = () => {
	const [activeModal, setActiveModal] = useState<ProjectModalType>("none");
	const [selectedProject, setSelectedProject] = useState<Proyecto | null>(
		null,
	);
    const [selectedEtapa, setSelectedEtapa] = useState<Etapa | null>(null);
    const [selectedManzana, setSelectedManzana] = useState<Manzana | null>(null);

	const openModal = (
        type: ProjectModalType, 
        project?: Proyecto,
        etapa?: Etapa,
        manzana?: Manzana
    ) => {
		if (project) setSelectedProject(project);
        if (etapa) setSelectedEtapa(etapa);
        if (manzana) setSelectedManzana(manzana);
		setActiveModal(type);
	};

	const closeModal = () => {
		setActiveModal("none");
        setTimeout(() => {
            setSelectedProject(null);
            setSelectedEtapa(null);
            setSelectedManzana(null);
        }, 300);
	};

	return {
		activeModal,
		selectedProject,
        selectedEtapa,
        selectedManzana,
		openModal,
		closeModal,
	};
};
