import React, { useContext } from 'react'
import { Context } from '../context/ContextProvider'
import { FaAnglesRight, } from 'react-icons/fa6'
import { NavLink } from 'react-router-dom'

const Error = () => {
    let { isDarkMode } = useContext(Context)
    return (
        <div className={`h-[100vh] flex items-center justify-center  ${isDarkMode ? "bg-linear_dark" : "bg-linear"}`}>
            <div className={`flex flex-col items-center  ${isDarkMode ? "bg-[#000]" : "bg-white"} shadow-2xl p-10 max-[300px]:p-5 mx-4 rounded-2xl`}>
                <img src={`/assets/logo/${isDarkMode ? 'Logo_dark' : 'Logo_light'}.svg`} className='max-w-[250px] max-md:max-w-[150px] max-[270px]:max-w-[100px] max-[270px]:min-w-[100px] max-md:min-w-[150px] min-w-[250px]' />
                <h1 className={`text-center text-[25px] max-md:text-[20px]  max-[350px]:text-[18px] font-sans font-normal ${isDarkMode ? "text-white" : "text-black"}`}><span>Error 404 -</span> Cтраница не найдена</h1>
                <NavLink to={"/login"} className={`${isDarkMode ? "bg-[#FFF] text-black hover:bg-[#121212] border hover:border hover:text-white" : "bg-[#2E70F5] text-white hover:bg-[#4157A3]"} outline-none  py-2 min-w-[195px] max-[300px]:min-w-[180px] max-[300px]:text-xs rounded-lg mt-5 flex justify-center gap-x-2 items-center  duration-300`}>Вернуться на страницу <FaAnglesRight /></NavLink>
            </div>

        </div>
    )
}

export default Error