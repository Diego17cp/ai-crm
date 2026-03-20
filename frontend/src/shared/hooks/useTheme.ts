import { ThemeContext } from "@/app/providers/ThemeProvider";
import { useContext } from "react";

// Custom hook to use the ThemeContext
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme must be used within a ThemeProvider");
    return context;
}