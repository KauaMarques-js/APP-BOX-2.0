import React, { useEffect, useState } from "react";
import Header from "../../components/Header.jsx";
import api from "../../services/api.js";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { estadosECidades } from "../../Auth/utils/estadosECidades.js";
import SelectField from "../../Auth/ui/SelectField.jsx";

// Configuração do ícone do mapa
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function OperadorConfirmado() {
  const [tarefas, setTarefas] = useState([]);
  const [tarefasFiltradas, setTarefasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [cancelando, setCancelando] = useState(false);

  const authData = JSON.parse(localStorage.getItem("authData"));
  const operadorId = authData?.id;

  useEffect(() => {
    carregarTarefasConfirmadas();
  }, [operadorId]);

  async function carregarTarefasConfirmadas() {
    if (!operadorId) {
      setError("Operador não autenticado");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const resposta = await api.get("/tarefas", {
        params: {
          operador_id: operadorId,
          operador_presente: 1,
          ativa: 1,
          confirmado: 0 // Garante que só traz tarefas NÃO concluídas
        }
      });

      // Filtra apenas tarefas que pertencem ao operador e não estão concluídas
      const tarefasConfirmadas = resposta.data
        .filter(tarefa => tarefa.operador_id === operadorId && tarefa.confirmado !== 1)
        .map(tarefa => ({
          ...tarefa,
          data: formatarData(tarefa.data),
        }));

      setTarefas(tarefasConfirmadas);
      setTarefasFiltradas(tarefasConfirmadas);
      setError(null);
    } catch (erro) {
      console.error("Erro ao carregar tarefas confirmadas:", erro);
      setError("Erro ao carregar tarefas. Tente recarregar a página.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (filtroEstado) {
      setTarefasFiltradas(tarefas.filter(tarefa => tarefa.estado === filtroEstado));
    } else {
      setTarefasFiltradas(tarefas);
    }
  }, [filtroEstado, tarefas]);

  const formatarData = (dataString) => {
    try {
      return new Date(dataString).toLocaleDateString("pt-BR");
    } catch {
      return dataString;
    }
  };

  async function cancelarPresenca(id) {
    const motivo = prompt("Por favor, informe o motivo do cancelamento:");
    
    if (!motivo || motivo.trim() === "") {
      alert("O motivo do cancelamento é obrigatório.");
      return;
    }

    try {
      setCancelando(true);
      
      // Verificação adicional de segurança
      const tarefa = tarefas.find(t => t.id === id);
      if (!tarefa) {
        throw new Error("Tarefa não encontrada na lista local");
      }

      // Bloqueia cancelamento se a tarefa estiver concluída (redundante, mas segura)
      if (tarefa.confirmado === 1) {
        alert("Esta tarefa já foi concluída e não pode ser cancelada.");
        return;
      }

      const response = await api.put(`/tarefas/${id}/cancelar`, {
        operador_id: operadorId,
        motivo: motivo.trim()
      });

      if (response.status === 200) {
        alert("Presença cancelada com sucesso!");
        setTarefas(prev => prev.filter(t => t.id !== id));
        setTarefasFiltradas(prev => prev.filter(t => t.id !== id));
      }
    } catch (erro) {
      console.error("Erro detalhado ao cancelar:", {
        message: erro.message,
        response: erro.response?.data,
        status: erro.response?.status
      });
      
      let mensagemErro = erro.message;
      if (erro.response?.data?.mensagem) {
        mensagemErro = erro.response.data.mensagem;
      }
      
      alert(`Não foi possível cancelar: ${mensagemErro}`);
    } finally {
      setCancelando(false);
    }
  }

  if (loading) return <div className="carregando">Carregando tarefas confirmadas...</div>;
  if (error) return <div className="erro">{error}</div>;

  return (
    <div>
      <Header />
      <main className="painel-operador">
        <h1>Tarefas Confirmadas</h1>

        <div className="filtro-container">
          <label htmlFor="filtro-estado">Filtrar por estado: </label>
          <SelectField
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            options={Object.keys(estadosECidades)}
            placeholder="Todos os estados"
          />
        </div>

        <div className="tarefas-lista">
          {tarefasFiltradas.length === 0 ? (
            <p>Você não tem tarefas confirmadas pendentes no momento.</p>
          ) : (
            tarefasFiltradas.map((tarefa) => (
              <div key={tarefa.id} className="tarefa-card">
                <h3>{tarefa.titulo}</h3>
                <p className="descricao">{tarefa.descricao}</p>
                <div className="info-tarefa">
                  <p><strong>Data:</strong> {tarefa.data}</p>
                  <p><strong>Local:</strong> {tarefa.estado}</p>
                </div>

                <button 
                  className="btn-cancelar"
                  onClick={() => cancelarPresenca(tarefa.id)}
                  disabled={cancelando}
                >
                  {cancelando ? "Cancelando..." : "Cancelar Presença"}
                </button>
              </div>
            ))
          )}
        </div>

        <div className="mapa-container">
          <MapContainer
            center={[-15.7797, -47.9297]}
            zoom={4}
            style={{ height: "500px", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {tarefasFiltradas.map((tarefa) => (
              <Marker
                key={`map-${tarefa.id}`}
                position={[tarefa.latitude, tarefa.longitude]}
              >
                <Popup>
                  <h4>{tarefa.titulo}</h4>
                  <p>{tarefa.descricao}</p>
                  <p><strong>Data:</strong> {tarefa.data}</p>
                  <p><strong>Estado:</strong> {tarefa.estado}</p>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </main>
    </div>
  );
}