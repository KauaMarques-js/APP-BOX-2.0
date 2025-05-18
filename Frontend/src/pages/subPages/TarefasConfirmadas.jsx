import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import api from "../../services/api";

export default function ConfirmarTarefa() {
  const [tarefasConfirmadas, setTarefasConfirmadas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConfirmadas() {
      try {
        const authData = JSON.parse(localStorage.getItem("authData") || "{}");
        if (!authData.id) {
          alert("Usuário não autenticado");
          setLoading(false);
          return;
        }
        const response = await api.get(`/tarefas?criador_id=${authData.id}`);
        const confirmadas = response.data.filter(t => t.confirmado === 1);
        setTarefasConfirmadas(confirmadas);
      } catch (error) {
        console.error("Erro ao buscar tarefas confirmadas:", error);
        alert(error.response?.data?.mensagem || "Erro ao carregar tarefas confirmadas");
      } finally {
        setLoading(false);
      }
    }
    fetchConfirmadas();
  }, []);

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <Header />
      <main className="container">
        <h1 className="page-title">Tarefas Confirmadas</h1>
        {tarefasConfirmadas.length === 0 ? (
          <p>Nenhuma tarefa confirmada</p>
        ) : (
          <div className="tarefas-grid">
            {tarefasConfirmadas.map((tarefa) => (
              <div key={tarefa.id} className="tarefa-card">
                <h3>{tarefa.titulo} ✅</h3>
                <p>{tarefa.descricao}</p>
                <p>Data: {new Date(tarefa.data).toLocaleDateString("pt-BR")}</p>
                <p>Estado: {tarefa.estado}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
