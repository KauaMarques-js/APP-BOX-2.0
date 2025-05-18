import React, { useEffect, useState } from "react";
import Header from "../../components/Header.jsx";
import api from "../../services/api.js";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { estadosECidades } from "../../Auth/utils/estadosECidades.js";
import SelectField from "../../Auth/ui/SelectField.jsx";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function PainelOperador(){
  const [tarefas, setTarefas] = useState([]);
  const [tarefasFiltradas, setTarefasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("");

  useEffect(() => {
    async function carregarTarefas() {
      try {
        const resposta = await api.get("/tarefas");
  
    
        const tarefasFiltradasPorConfirmacao = resposta.data
          .filter((tarefa) => 
            tarefa.ativa === 1 && 
            tarefa.confirmado === 0 && 
            tarefa.operador_presente === 0
          )
          .map((tarefa) => ({
            ...tarefa,
            data: formatarData(tarefa.data),
          }));
  
        setTarefas(tarefasFiltradasPorConfirmacao);
        setTarefasFiltradas(tarefasFiltradasPorConfirmacao);
      } catch (erro) {
        console.error("Erro ao carregar tarefas:", erro);
        setError("Erro ao carregar tarefas");
      } finally {
        setLoading(false);
      }
    }
  
    carregarTarefas();
  }, []);

  useEffect(() => {
    if (filtroEstado) {
      const filtradas = tarefas.filter(
        (tarefa) => tarefa.estado === filtroEstado
      );
      setTarefasFiltradas(filtradas);
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

  async function confirmarPresenca(id) {
    try {
      // Passar operador_id aqui, para backend saber qual operador confirmou
      const authData = JSON.parse(localStorage.getItem("authData"));
      const operador_id = authData?.id;

      if (!operador_id) {
        alert("Operador não identificado. Faça login novamente.");
        return;
      }

      await api.put(`/tarefas/${id}/concluir`, { operador_id });

      alert("Presença confirmada com sucesso!");
      // Remove a tarefa confirmada da lista local
      setTarefas((prev) => prev.filter((t) => t.id !== id));
      setTarefasFiltradas((prev) => prev.filter((t) => t.id !== id));
    } catch (erro) {
      console.error("Erro ao confirmar presença:", erro);
      alert("Erro ao confirmar presença.");
    }
  }

  if (loading) return <div>Carregando tarefas...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <Header />
      <main className="painel-operador">
        <h1>Painel do Operador</h1>

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
          {tarefasFiltradas.length === 0 && <p>Não há tarefas para mostrar.</p>}
          {tarefasFiltradas.map((tarefa) => (
            <div key={tarefa.id} className="tarefa-card">
              <h3>{tarefa.titulo}</h3>
              <p>{tarefa.descricao}</p>
              <p>Data: {tarefa.data}</p>
              <small>Estado: {tarefa.estado}</small>

              <div style={{ marginTop: "10px" }}>
                <button onClick={() => confirmarPresenca(tarefa.id)}>
                  Confirmar Presença
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mapa-container">
          <MapContainer
            center={[-23.5505, -46.6333]}
            zoom={13}
            style={{ height: "400px", width: "100%" }}
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
                  <strong>{tarefa.titulo}</strong>
                  <p>{tarefa.descricao}</p>
                  <p>Data: {tarefa.data}</p>
                  <p>Estado: {tarefa.estado}</p>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </main>
    </div>
  );
}
