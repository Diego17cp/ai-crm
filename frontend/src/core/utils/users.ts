export const isSuperAdmin = (userRole: string) => {
	const role = userRole.toLowerCase();
	return (
		role === "superadmin" ||
		role === "super_admin" ||
		role === "super-admin" ||
		role === "admin" ||
		role === "administrator"
	);
};
