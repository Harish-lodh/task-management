import { useState } from 'react'
import './App.css'
import { BrowserRouter } from "react-router-dom";

import AppRoutes from "./routes/AppRoutes";
import { ToastContainer } from 'react-toastify';

function App() {


  return (
    <BrowserRouter>
   <AppRoutes />  <ToastContainer position="top-right" autoClose={5000} /></BrowserRouter>
  )
}

export default App
