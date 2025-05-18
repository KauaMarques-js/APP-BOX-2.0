import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import api from "../../services/api";

function AdminDashboard() {
  const [usuarios, setUsuarios] = useState([]);
  const [busca, setBusca] = useState("");
  const [resultadoBusca, setResultadoBusca] = useState([]);
  const [buscou, setBuscou] = useState(false);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      const response = await api.get("/usuarios");
      setUsuarios(response.data);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
    }
  };

  const excluirUsuario = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
      try {
        await api.delete(`/usuarios/${id}`);
        setUsuarios(usuarios.filter((u) => u.id !== id));
        setResultadoBusca(resultadoBusca.filter((u) => u.id !== id));
      } catch (err) {
        console.error("Erro ao excluir usuário:", err);
      }
    }
  };

  const trocarRole = async (id, novaRole) => {
    try {
      await api.put(`/usuarios/${id}/role`, { role: novaRole });
      setUsuarios(
        usuarios.map((u) =>
          u.id === id ? { ...u, role: novaRole } : u
        )
      );
      setResultadoBusca(
        resultadoBusca.map((u) =>
          u.id === id ? { ...u, role: novaRole } : u
        )
      );
    } catch (err) {
      console.error("Erro ao atualizar role:", err);
    }
  };

  const handleBuscar = () => {
    setBuscou(true);

    if (busca.trim() === "") {
      setResultadoBusca([]);
      return;
    }

    const filtrados = usuarios.filter((u) =>
      u.email.toLowerCase().startsWith(busca.toLowerCase())
    );
    setResultadoBusca(filtrados);
  };

  const proximaRole = (roleAtual) => {
    if (roleAtual === "operador") return "empresa";
    if (roleAtual === "empresa") return "operador";
    return "operador"; // caso admin ou outro
  };

  return (
    <>
      <Header />
      <div className="container">
        <div className="card animated-card">
          <h1 className="page-title">Painel de Administração</h1>

          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <input
              type="text"
              placeholder="Buscar usuário por email"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{ flex: 1 }}
            />
            <button onClick={handleBuscar} className="btn">
              Procurar
            </button>
          </div>

          {buscou && busca.trim() === "" ? (
            <p className="texto-central">Adicione algo para pesquisar.</p>
          ) : buscou && resultadoBusca.length === 0 ? (
            <p className="texto-central">Nenhum usuário encontrado.</p>
          ) : (
            <ul className="lista">
              {resultadoBusca.map((usuario) => (
                <li key={usuario.id} className="item">
                  <div className="item-info">
                    <strong>{usuario.nome}</strong> — {usuario.email}
                    <span className="role">({usuario.role})</span>
                  </div>
                  <div className="botoes">
                    <button
                      onClick={() =>
                        trocarRole(usuario.id, proximaRole(usuario.role))
                      }
                      className="btn"
                    >
                      Trocar Cargo
                    </button>
                    <button
                      onClick={() => excluirUsuario(usuario.id)}
                      className="btn btn-excluir"
                    >
                      Excluir Usuario
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
