import type { User } from "@/core/types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isAdmin: boolean;
	setUser: (user: User | null) => void;
	clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
	devtools((set) => ({
		user: null,
		isAuthenticated: false,
		isAdmin: false,
		setUser: (user: User) =>
			set(() => ({
				user,
				isAuthenticated: true,
				isAdmin: user.rol?.toLowerCase() === "admin",
			})),
		clearAuth: () =>
			set(() => ({
				user: null,
				isAuthenticated: false,
				isAdmin: false,
			})),
	})),
);