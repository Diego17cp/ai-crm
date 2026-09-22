import { useAuthStore } from "@/features/auth";
import { Loader } from "dialca-ui";
import { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { toast } from "sonner";

interface Props {
	children: React.ReactNode;
	isRestricted?: boolean;
	allowedRoles?: string[];
	deniedRoles?: string[];
}
export const ProtectedRoute: React.FC<Props> = ({
	children,
	isRestricted = false,
	allowedRoles,
	deniedRoles,
}) => {
	const { isAuthenticated, user, isAdmin, isInitialized } = useAuthStore();
	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		if (
			!isInitialized &&
			isAuthenticated &&
			user &&
			user.estado === "INACTIVO"
		) {
			toast.error(
				"Tu cuenta está inactiva. Por favor, contacta al soporte.",
			);
		}
	}, [isInitialized, isAuthenticated, user, navigate]);
	if (!isInitialized) {
		return (
			<div className="flex justify-center items-center dark:bg-gray-950 h-screen">
				<Loader
					classes={{
						innerRing: "border-t-pink-500 dark:border-t-pink-500",
						outerRing: "border-t-pink-500 dark:border-t-pink-500",
					}}
				/>
			</div>
		);
	}
	if (!isAuthenticated)
		return (
			<Navigate
				to="/auth/login"
				state={{ from: location.pathname }}
				replace
			/>
		);
	if (isAuthenticated && user && user.estado === "INACTIVO")
		return <Navigate to="/auth/login" replace />;
	if (isAuthenticated && user) {
		const userRole = user.rol;
		if (isRestricted && !isAdmin)
			return <Navigate to="/unauthorized" replace />;
		if (
			allowedRoles &&
			allowedRoles.length > 0 &&
			!allowedRoles.includes(userRole)
		)
			return <Navigate to="/unauthorized" replace />;
		if (
			deniedRoles &&
			deniedRoles.length > 0 &&
			deniedRoles.includes(userRole)
		)
			return <Navigate to="/unauthorized" replace />;
	}
	return <>{children}</>;
};
