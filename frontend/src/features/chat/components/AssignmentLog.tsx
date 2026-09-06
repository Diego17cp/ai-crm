import { FiUserCheck } from "react-icons/fi";
import { formatChatDate } from "../utils/chatFormatters";
import type { Assignment } from "../types";

export const AssignmentLog = ({ asignaciones }: { asignaciones: Assignment[] }) => {
	if (asignaciones.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
				<FiUserCheck size={32} className="mb-2 opacity-50" />
				Sin asignaciones registradas
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{asignaciones.map((a) => (
				<div key={a.id} className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
					<div className="flex justify-between items-center">
						<p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
							{a.usuario.nombres} {a.usuario.apellidos}
						</p>
						{!a.fecha_fin && (
							<span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
								Activa
							</span>
						)}
					</div>
					<p className="text-xs text-gray-500 mt-1">
						{formatChatDate(a.fecha_inicio)} {a.fecha_fin ? `→ ${formatChatDate(a.fecha_fin)}` : ""}
					</p>
					{a.motivo && <p className="text-xs text-gray-400 mt-1 italic">{a.motivo}</p>}
				</div>
			))}
		</div>
	);
};