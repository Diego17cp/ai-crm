import type { User } from "@/core/types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isAdmin: boolean;
	isInitialized: boolean;
	setUser: (user: User | null) => void;
	clearAuth: () => void;
	setInitialized: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
	devtools((set) => ({
		user: null,
		isAuthenticated: false,
		isAdmin: false,
		isInitialized: false,
		setUser: (user) =>
			set(() => ({
				user,
				isAuthenticated: !!user,
				isAdmin: user?.rol?.toLowerCase() === "admin",
			})),
		clearAuth: () =>
			set(() => ({
				user: null,
				isAuthenticated: false,
				isAdmin: false,
			})),
		setInitialized: (value) => set(() => ({ isInitialized: value })),
	})),
);
