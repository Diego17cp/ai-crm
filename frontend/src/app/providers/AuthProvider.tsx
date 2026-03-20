import { AuthProvider as Auth } from "@/features/auth";
export const AuthProvider = ({ children }: { children: React.ReactNode }) => (
	<Auth>{children}</Auth>
);
