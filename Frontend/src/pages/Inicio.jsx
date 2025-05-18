import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/global.css';

export default function Inicio() {
  return (
    <div className="container fade-in">
      <div className="card animated-card">
        <h1 className="animated-title">Bem-vindo!</h1>
        <p className="animated-subtext">App de operadores e repositores, faça login para acessar:</p>

        <div className="buttons animated-buttons">
          <Link to="/login">
            <button className="btn">Login</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
