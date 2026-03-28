import { useState } from "react";
import type { User } from "../types";

export type UserModalType =
	| "none"
	| "create_user"
	| "edit_user"
	| "delete_user";

export const useUserModals = () => {
	const [activeModal, setActiveModal] = useState<UserModalType>("none");
	const [selectedUser, setSelectedUser] = useState<User | null>(null);

	const openModal = (type: UserModalType, user?: User) => {
		if (user) setSelectedUser(user);
		setActiveModal(type);
	};

	const closeModal = () => {
		setActiveModal("none");
		setTimeout(() => {
			setSelectedUser(null);
		}, 300);
	};

	return {
		activeModal,
		selectedUser,
		openModal,
		closeModal,
	};
};