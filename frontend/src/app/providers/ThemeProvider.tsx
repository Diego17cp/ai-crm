import { THEME_KEY } from "@/shared/constants";
import React, { createContext, useEffect, useState } from "react";

interface Type {
    theme: "light" | "dark";
    toggleTheme: () => void;
}

export const ThemeContext = createContext<Type | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<"light" | "dark">(() => {
        const savedTheme = localStorage.getItem(THEME_KEY);
        return (savedTheme === "dark" ? "dark" : "light");
    });

    useEffect(() => {
        if (theme === "dark") document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
        localStorage.setItem(THEME_KEY, theme);
    }, [theme]);

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === THEME_KEY && e.newValue !== null) {
                const newTheme = e.newValue as "light" | "dark";
                if (newTheme !== theme && (newTheme === "light" || newTheme === "dark")) {
                    setTheme(newTheme);
                }
            }
        }
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [theme]);

    const toggleTheme = () => setTheme((prev : "light" | "dark") => (prev === "light" ? "dark" : "light"));
    
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}