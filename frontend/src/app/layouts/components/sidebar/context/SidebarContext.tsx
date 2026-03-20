import React, { createContext, useEffect, useState } from "react";

interface SidebarTypes {
    isOpen: boolean;
    toggleSidebar: () => void;
    closeSidebar: () => void;
}

export const SidebarContext = createContext<SidebarTypes | null>(null)

export const SidebarContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(() => {
        const storedState = localStorage.getItem('ai-crm:sidebar-open');
        return storedState !== null ? JSON.parse(storedState) : true;
    })
    useEffect(() => {
        localStorage.setItem('ai-crm:sidebar-open', JSON.stringify(isOpen));
    }, [isOpen])
    const toggleSidebar = () => setIsOpen((prev : boolean) => !prev)
    const closeSidebar = () => setIsOpen(false)

    return (
        <SidebarContext.Provider value={{ isOpen, toggleSidebar, closeSidebar }}>
            {children}
        </SidebarContext.Provider>
    )
} 