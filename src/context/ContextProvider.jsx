import React, { createContext, useCallback, useEffect, useState } from 'react'

let Context = createContext()
const ContextProvider = ({ children }) => {
    // let [role, setRole] = useState("")
    // let fetchData = useCallback(async () => {
    //     try {
    //         let response = await fetch("https://dev.royal-pay.org/api/v1/accounts/me", {
    //             method: "GET",
    //             headers: {
    //                 "Authorization": `Bearer ${localStorage.getItem("access")}`,
    //             }
    //         })
    //         let data = await response.json()
    //         localStorage.setItem("role", data?.role)
    //     } catch (error) {
    //         console.log(error)
    //     }
    // }, [])
    // useEffect(() => {
    //     fetchData()
    // }, [fetchData])
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