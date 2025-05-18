import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authData');
    navigate('/login');
    window.location.reload();
  };

  const authData = JSON.parse(localStorage.getItem('authData') || '{}');
  const isLogado = authData.isLogged === true;
  const role = authData.role;

  return (
    <header>
      <h2>App Box</h2>
      <nav className="header-nav">
        {isLogado && role === "empresa" && (
          <>
            <Link to="/painel-empresa" className="nav-link">Cadastrar Tarefa</Link>
            <Link to="/controle-presencas" className="nav-link">Trabalhos confirmados</Link>
            <Link to="/control-tarefa" className="nav-link">Controlar Tarefas</Link>
            <Link to="/tarefas-confirmadas" className="nav-link">Já Feitas</Link>
          </>
        )}

        {isLogado && role === "operador" && (
          <>
            <Link to="/painel-operador" className="nav-link">Trabalhos Disponiveis</Link>
            <Link to="/operador-confirmado" className="nav-link">Trabalhos Confrimados</Link>


          </>
        )}

        {isLogado && (
          <Link to="#" onClick={handleLogout} className="nav-link">Sair</Link>
        )}
      </nav>
    </header>
  );
}
