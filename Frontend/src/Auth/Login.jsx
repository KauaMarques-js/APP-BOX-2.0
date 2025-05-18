import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import Header from "../components/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showToast } from "./utils/toastUtils";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await api.post("/login", { email, senha });
      const data = response.data;
  
      // Verifica se veio role e id
      if (!data.role || !data.id) {
        throw new Error("Dados incompletos do servidor");
      }
  
      // Salva todos os dados necessários
      const authData = {
        role: data.role,
        id: data.id,
        token: data.token || null,
        nome: data.nome || "",
        email: data.email || email,
        isLogged: true
      };
  
      localStorage.setItem("authData", JSON.stringify(authData));
  
      // Redireciona conforme o role
      const routes = {
        empresa: "/painel-empresa",
        operador: "/painel-operador",
        admin: "/admin"
      };
  
      const redirectTo = routes[data.role];
      
      if (redirectTo) {
        showToast("success", `Bem-vindo ${data.nome || ''}!`, {
          autoClose: 2000,
          onClose: () => navigate(redirectTo),
        });
      } else {
        showToast("error", "Seu perfil não tem um painel definido");
      }
  
    } catch (err) {
      console.error(err);
      showToast(
        "error",
        err.response?.data?.erro || "Erro ao fazer login"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Header />
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <div className="page-center">
        <div className="form-card">
          <h1 className="form-title">Login</h1>
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="senha">Senha</label>
              <input
                id="senha"
                type="password"
                placeholder="Sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                autoComplete="current-password"
                className="form-input"
              />
            </div>

            <button
              type="submit"
             className="submit-btn"
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          <div className="form-footer">
            <p>
              Não tem uma conta? <Link to="/cadastro" className="link">Cadastre-se</Link>
            </p>
            <p>
              <Link to="/recuperar-senha" className="link">Esqueceu sua senha?</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;