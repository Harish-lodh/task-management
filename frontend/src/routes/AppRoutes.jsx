
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Layout from "../layout/Layout";
import TicketBoardMUI from "../pages/TicketBoard";
import UserTicketBoard  from "../pages/UserTicketBoard"
import Dashboard from "../pages/Dashboard";

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
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tickets" element={<TicketBoardMUI />} />
                <Route path="/user/tickets" element={<UserTicketBoard />} />

            </Route>
        </Routes>
    );
};

export default AppRoutes;