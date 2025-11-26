
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Layout from "../layout/Layout";
import TicketBoardMUI from "../pages/admin/TicketBoard";
import MyticketsForAdmin from "../pages/admin/Mytickets";

import AssignTicketBoard  from "../pages/user/AssignTicketBoard"
import Mytickets from "../pages/user/Mytickets"
import Dashboard from "../pages/admin/Dashboard";

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
                    <Route path="/my-tickets" element={<MyticketsForAdmin />} />

                {/* user only */}
                <Route path="/user-dashboard" element={<h1>user dashboard</h1>}/>
                <Route path="/user/tickets" element={< AssignTicketBoard/>} />
                <Route path="/user/my-tickets" element={< Mytickets/>} />


            </Route>
        </Routes>
    );
};

export default AppRoutes;