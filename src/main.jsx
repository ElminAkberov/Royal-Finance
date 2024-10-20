import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./styles/style.css"
import Login from "./Login/Login";
import Layout from "./Layout";
import Dashboard from "./Dash/Dashboard";
import ContextProvider from "./context/ContextProvider";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />, children: [{ path: "/login", element: <Login /> }, { path: "/", element: <Login /> }, { path: "/dash", element: <Dashboard /> }]
  }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <ContextProvider>
    <RouterProvider router={router} />
  </ContextProvider>
);