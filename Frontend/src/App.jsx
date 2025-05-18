// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Inicio from "./pages/Inicio";
import Login from "./Auth/Login";
import PainelEmpresa from "./pages/Paineis/PainelEmpresa";
import PainelOperador from "./pages/Paineis/PainelOperador";
import Cadastro from "./Auth/Cadastro";
import AdminDashboard from "./pages/admin/AdminDashboard";
import 'react-toastify/dist/ReactToastify.css';
import ControlTarefa from "./pages/subPages/ControlTarefas";
import ConfirmarTarefa from "./pages/subPages/TarefasConfirmadas";
import OperadorConfirmado from "./pages/subPages/OperadorConfirmado";
import EmpresaControlePresencas from "./pages/subPages/EmpresaControlePr";
import AdminTarefasConcluidas from "./pages/admin/AdminTarefasConcluidas";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const authData = JSON.parse(localStorage.getItem("authData") || "{}");

  if (!authData.isLogged) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(authData.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* Rotas protegidas - Empresa */}
        <Route
          path="/painel-empresa/*"
          element={
            <ProtectedRoute allowedRoles={["empresa"]}>
              <PainelEmpresa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/control-tarefa"
          element={
            <ProtectedRoute allowedRoles={["empresa"]}>
              <ControlTarefa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tarefas-confirmadas"
          element={
            <ProtectedRoute allowedRoles={["empresa"]}>
              <ConfirmarTarefa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/controle-presencas"
          element={
            <ProtectedRoute allowedRoles={["empresa"]}>
              <EmpresaControlePresencas />
            </ProtectedRoute>
          }
        />

        {/* Rotas protegidas - Operador */}
        <Route
          path="/painel-operador"
          element={
            <ProtectedRoute allowedRoles={["operador"]}>
              <PainelOperador />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operador-confirmado"
          element={
            <ProtectedRoute allowedRoles={["operador"]}>
              <OperadorConfirmado />
            </ProtectedRoute>
          }
        />

        {/* Rotas protegidas - Admin */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
           <Route
          path="/Tarefas-Export/*"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminTarefasConcluidas/>
            </ProtectedRoute>
          }
        />

        {/* Rota fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
