import React, { useContext } from 'react'
import { BeatLoader } from 'react-spinners'
import { Context } from '../context/ContextProvider'

const MainLoading = () => {
    let { isDarkMode } = useContext(Context)
    return (
        <div className={`flex h-[100vh] items-center justify-center ${isDarkMode ? "bg-[#121212]" : "bg-white"}`}>
            <BeatLoader color='#2E70F5' />
        </div>
    )
}

export default MainLoading