import React, { useEffect, useState } from "react";
import Header from "../../components/Header.jsx";
import api from "../../services/api.js";

export default function EmpresaControlePresencas() {
  const [tarefas, setTarefas] = useState([]);
  const [erro, setErro] = useState(null);
  const authData = JSON.parse(localStorage.getItem("authData"));
  const criadorId = authData?.id;

  useEffect(() => {
    async function carregarTarefas() {
      try {
        const resp = await api.get("/tarefas", {
          params: { criador_id: criadorId }
        });

        setTarefas(resp.data);
      } catch (err) {
        setErro("Erro ao carregar tarefas");
        console.error(err);
      }
    }

    if (criadorId) carregarTarefas();
  }, [criadorId]);

  const handleConfirmarTarefa = async (id) => {
    if (window.confirm("Confirmar que a tarefa foi concluída pelo operador?")) {
      try {
        await api.put(`/tarefas/${id}`, { confirmado: 1 });

        setTarefas((prev) =>
          prev.map((t) => (t.id === id ? { ...t, confirmado: 1 } : t))
        );
      } catch (error) {
        console.error("Erro ao confirmar tarefa:", error);
        alert("Erro ao confirmar tarefa.");
      }
    }
  };

  const handleReativarTarefa = async (id) => {
    if (window.confirm("Colocar esta tarefa no ar novamente?")) {
      try {
        await api.put(`/tarefas/${id}`, {
          operador_id: null,
          operador_presente: 0,
          justificativa_cancelamento: null,
          confirmado: 0,
          ativa: 1
        });

        setTarefas((prev) =>
          prev.map((t) =>
            t.id === id
              ? {
                  ...t,
                  operador_id: null,
                  operador_presente: 0,
                  justificativa_cancelamento: null,
                  confirmado: 0,
                  ativa: 1
                }
              : t
          )
        );
      } catch (error) {
        console.error("Erro ao reativar tarefa:", error);
        alert("Erro ao reativar tarefa.");
      }
    }
  };

  if (erro) return <div>{erro}</div>;

  return (
    <div>
      <Header />
      <main className="container">
        <h1>Controle de Presenças</h1>

        {tarefas.length === 0 ? (
          <p>Você ainda não criou nenhuma tarefa.</p>
        ) : (
          tarefas.map((tarefa) => (
            <div key={tarefa.id} className="tarefa-card">
              <h3>{tarefa.titulo}</h3>
              <p>{tarefa.descricao}</p>
              <p>Data: {new Date(tarefa.data).toLocaleDateString("pt-BR")}</p>
              <p>Estado: {tarefa.estado}</p>

              {tarefa.operador_presente ? (
                <div className="operador-info">
                  <h4>Operador Confirmado:</h4>
                  <p><strong>Nome:</strong> {tarefa.operador_nome}</p>
                  <p><strong>CPF:</strong> {tarefa.operador_cpf}</p>
                </div>
              ) : (
                <p style={{ color: "gray" }}>
                  Nenhum operador confirmou presença ainda.
                </p>
              )}

              {(tarefa.justificativa_cancelamento || tarefa.ativa === 0) && (
                <>
                  {tarefa.justificativa_cancelamento && (
                    <p style={{ color: "red" }}>
                      Cancelado: {tarefa.justificativa_cancelamento}
                    </p>
                  )}
                  <button
                    className="btn"
                    onClick={() => handleReativarTarefa(tarefa.id)}
                  >
                    Colocar no ar novamente
                  </button>
                </>
              )}

              {tarefa.operador_presente && tarefa.confirmado !== 1 && (
                <button
                  
                  onClick={() => handleConfirmarTarefa(tarefa.id)}
                >
                  Confirmar Tarefa
                </button>
              )}

              {tarefa.confirmado === 1 && (
                <p style={{ color: "green", fontWeight: "bold" }}>
                  Tarefa confirmada como concluída.
                </p>
              )}
            </div>
          ))
        )}
      </main>
    </div>
  );
}
