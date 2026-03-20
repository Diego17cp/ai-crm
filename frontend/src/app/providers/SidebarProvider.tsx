import { SidebarContextProvider } from "../layouts/components/sidebar/context/SidebarContext";

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <SidebarContextProvider>
        {children}
    </SidebarContextProvider>
)