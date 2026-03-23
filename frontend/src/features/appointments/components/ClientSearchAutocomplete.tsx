import { useState, useEffect } from "react";
import { FiSearch, FiUser, FiCheck, FiX } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/core/api";
import { useClickOutside } from "@/shared/hooks";
import type { Lead } from "@/features/leads/types";

interface ClientSearchProps {
    onSelectClient: (clientId: number | null) => void;
    selectedClientId: number | null;
}

export const ClientSearchAutocomplete = ({ onSelectClient, selectedClientId }: ClientSearchProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [selectedClientName, setSelectedClientName] = useState("");

    const wrapperRef = useClickOutside(() => setIsOpen(false));

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data: leads, isFetching } = useQuery({
        queryKey: ["leads_search", debouncedSearch],
        queryFn: async () => {
            if (!debouncedSearch.trim()) return [];
            const response = await apiClient.get(`/leads?q=${debouncedSearch}&limit=10`);
            return response.data.data;
        },
        enabled: Boolean(debouncedSearch.trim()),
    });

    const handleSelect = (lead: Lead) => {
        onSelectClient(lead.id);
        setSelectedClientName(`${lead.nombres || ""} ${lead.apellidos || ""}`.trim() || lead.numero);
        setSearchTerm("");
        setIsOpen(false);
    };

    const clearSelection = () => {
        onSelectClient(null);
        setSelectedClientName("");
    };

    if (selectedClientId) {
        return (
            <div className="flex items-center justify-between bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800/50 p-3 rounded-xl">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400">
                        <FiUser size={16} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Cliente Seleccionado</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{selectedClientName}</p>
                    </div>
                </div>
                <button type="button" onClick={clearSelection} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <FiX size={18} />
                </button>
            </div>
        );
    }

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400" />
                </div>
                <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-teal-500 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
                    placeholder="Buscar por DNI, Nombre o Email..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                />
                {isFetching && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </div>

            {isOpen && leads && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 max-h-60 overflow-y-auto main-scrollbar">
                    {leads.length > 0 ? (
                        leads.map((lead: Lead) => (
                            <button
                                key={lead.id}
                                type="button"
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-3 transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-0"
                                onClick={() => handleSelect(lead)}
                            >
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {lead.nombres} {lead.apellidos}
                                    </p>
                                    <p className="text-xs text-gray-500">Doc: {lead.numero}</p>
                                </div>
                                <FiCheck className="text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        ))
                    ) : (
                        debouncedSearch && !isFetching && (
                            <div className="p-4 text-center text-sm text-gray-500">
                                No se encontraron clientes
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
};