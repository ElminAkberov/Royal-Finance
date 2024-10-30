import React from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'

const Layout = () => {
    const location = useLocation();

    if (localStorage.getItem("role") === "trader" && location.pathname === "/dash") {
        return <Navigate to={"/deposit"} replace />;
    }

    return (
        <div className='inter'>
            <Outlet />
        </div>
    );
}

export default Layout;
