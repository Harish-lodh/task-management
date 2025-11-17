import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/login";
import Layout from "../layout/Layout";
import Dashboard from '../pages/Dashboard';

// Import other page components as needed, e.g.:
// import Dashboard from "../pages/Dashboard";

// Simple ProtectedRoute component (move to its own file if preferred)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
     
            </Route>
        </Routes>
    );
};

export default AppRoutes;