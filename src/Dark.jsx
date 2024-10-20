import React, { useContext, useEffect, useState } from 'react';
import { Switch } from 'antd';
import { Context } from './context/ContextProvider';
const Dark = () => {
    let {isDarkMode,toggleDarkMode} = useContext(Context)

    return (
        <Switch style={{ backgroundColor: isDarkMode  ? '#fff' : '#2D54DD' }} className={`custom-switch ${isDarkMode  && "black"}`} checked={isDarkMode} onChange={toggleDarkMode} />
    )
}
export default Dark;