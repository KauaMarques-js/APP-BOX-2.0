import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function ControlTarefa() {
  const [tarefas, setTarefas] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    data: "",
    estado: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTarefas() {
      try {
        const authData = JSON.parse(localStorage.getItem("authData") || "{}");
        const response = await api.get(`/tarefas?criador_id=${authData.id}`);
        
        const tarefasNaoConfirmadas = response.data.filter(t => t.confirmado === 0);
        setTarefas(tarefasNaoConfirmadas);
      } catch (error) {
        console.error("Erro ao buscar tarefas:", error);
        alert(error.response?.data?.mensagem || "Erro ao carregar tarefas");
      }
    }

    fetchTarefas();
  }, []);

  const handleEdit = (tarefa) => {
    setEditingId(tarefa.id);
    setFormData({
      titulo: tarefa.titulo,
      descricao: tarefa.descricao,
      data: tarefa.data.split('T')[0],
      estado: tarefa.estado
    });
  };

  const handleUpdate = async (id) => {
    try {
      const response = await api.put(`/tarefas/${id}`, formData);
      
      if (response.data.mensagem) {
        alert(response.data.mensagem);
      }
      
      setTarefas(tarefas.map(t => t.id === id ? { ...t, ...formData } : t));
      setEditingId(null);
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      alert(error.response?.data?.mensagem || "Erro ao atualizar tarefa");
    }
  };

  return (
    <div>
      <Header />
      <main className="container">
        <h1>Controle de Tarefas</h1>

        {tarefas.length === 0 ? (
          <p>Nenhuma tarefa cadastrada</p>
        ) : (
          <div className="tarefas-grid">
            {tarefas.map((tarefa) => (
              <div key={tarefa.id} className="tarefa-card">
                {editingId === tarefa.id ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      placeholder="Título"
                      required
                    />
                    <textarea
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      placeholder="Descrição"
                      required
                    />
                    <input
                      type="date"
                      value={formData.data}
                      onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                      required
                    />
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      required
                    >
                      <option value="">Selecione um estado</option>
                      <option value="Pendente">Pendente</option>
                      <option value="Em andamento">Em andamento</option>
                      <option value="Concluído">Concluído</option>
                    </select>
                    <div className="action-buttons">
                      <button
                        type="button"
                     
                        onClick={() => handleUpdate(tarefa.id)}
                      >
                        Salvar
                      </button>
                      <button
                        type="button"
                       
                        onClick={() => setEditingId(null)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3>{tarefa.titulo}</h3>
                    <p>{tarefa.descricao}</p>
                    <p>Data: {new Date(tarefa.data).toLocaleDateString("pt-BR")}</p>
                    <p>Estado: {tarefa.estado}</p>
                    <div className="action-buttons">
                      <button
                        type="button"
                        
                        onClick={() => handleEdit(tarefa)}
                      >
                        Editar
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
