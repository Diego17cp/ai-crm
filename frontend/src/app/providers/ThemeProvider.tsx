import React, { createContext, useEffect, useState } from "react";

interface Type {
    theme: "light" | "dark";
    toggleTheme: () => void;
}

export const ThemeContext = createContext<Type | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<"light" | "dark">(() => {
        const savedTheme = localStorage.getItem("ai-crm:theme");
        return (savedTheme === "dark" ? "dark" : "light");
    });

    useEffect(() => {
        if (theme === "dark") document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
        localStorage.setItem("ai-crm:theme", theme);
    }, [theme]);

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "ai-crm:theme" && e.newValue !== null) {
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