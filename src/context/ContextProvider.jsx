import React, { createContext, useState } from 'react'

let Context = createContext()
const ContextProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem("dark") === "true";
    });
    const toggleDarkMode = (checked) => {
        setIsDarkMode(checked);
        localStorage.setItem("dark", checked); 
    };
    return (
        <Context.Provider value={{ isDarkMode, toggleDarkMode }}>{children}</Context.Provider>
    )
}
export default ContextProvider
export { Context }