import React, { useEffect, useState } from 'react';
import Header from '../../components/Header.jsx';
import api from '../../services/api.js';
import * as XLSX from 'xlsx';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Corrige o ícone padrão do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function AdminTarefasConcluidas() {
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroData, setFiltroData] = useState('');

  useEffect(() => {
    carregarTarefasConcluidas();
  }, []);

  async function carregarTarefasConcluidas() {
    try {
      setLoading(true);
      const response = await api.get('/tarefas/concluidas');
      setTarefas(response.data);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar tarefas:', err);
      setError('Erro ao carregar tarefas concluídas');
    } finally {
      setLoading(false);
    }
  }

  function formatarData(dataString) {
    try {
      return new Date(dataString).toLocaleDateString('pt-BR');
    } catch {
      return dataString;
    }
  }

  function exportarTodasParaExcel() {
    const dadosFormatados = tarefas.map(tarefa => ({
      'ID': tarefa.id,
      'Título': tarefa.titulo,
      'Descrição': tarefa.descricao,
      'Data': formatarData(tarefa.data),
      'Localização': `${tarefa.latitude}, ${tarefa.longitude}`,
      'Estado': tarefa.estado,
      'Solicitante': tarefa.criador_nome,
      'CPF Solicitante': tarefa.criador_cpf,
      'Operador': tarefa.operador_nome || 'N/A',
      'CPF Operador': tarefa.operador_cpf || 'N/A',
      'Telefone Operador': tarefa.operador_telefone || 'N/A',
      'Data Conclusão': formatarData(tarefa.data_conclusao) || 'N/A'
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(dadosFormatados);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tarefas Concluídas");
    XLSX.writeFile(workbook, "tarefas_concluidas.xlsx");
  }

  function exportarTarefaIndividual(tarefa) {
    const dados = [{
      'ID': tarefa.id,
      'Título': tarefa.titulo,
      'Descrição': tarefa.descricao,
      'Data': formatarData(tarefa.data),
      'Localização': `${tarefa.latitude}, ${tarefa.longitude}`,
      'Estado': tarefa.estado,
      'Solicitante': tarefa.criador_email,
      'CPF Solicitante': tarefa.criador_cpf,
      'Operador': tarefa.operador_nome || 'N/A',
      'CPF Operador': tarefa.operador_cpf || 'N/A',
      'Data Conclusão': formatarData(tarefa.data) || 'N/A'
    }];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(dados);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tarefa");
    XLSX.writeFile(workbook, `tarefa_${tarefa.id}.xlsx`);
  }

  const tarefasFiltradas = filtroData
    ? tarefas.filter(t => t.data.includes(filtroData))
    : tarefas;

  if (loading) return <div>Carregando tarefas concluídas...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <Header />
      <main className="painel-admin">
        <h1>Tarefas Concluídas</h1>

        <div className="controles-admin">
          <div className="filtro-data">
            <label>Filtrar por data:</label>
            <input
              type="date"
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
            />
          </div>

          <button
            className="btn-exportar"
            onClick={exportarTodasParaExcel}
            disabled={tarefas.length === 0}
          >
            Exportar todas para Excel
          </button>
        </div>

        <div className="tarefas-lista">
          {tarefasFiltradas.length === 0 ? (
            <p>Nenhuma tarefa concluída encontrada</p>
          ) : (
            <div className="tabela-container">
              <table className="tabela-tarefas">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Data</th>
                    <th>Localização</th>
                    <th>Solicitante</th>
                    <th>Operador</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {tarefasFiltradas.map(tarefa => (
                    <tr key={tarefa.id}>
                      <td>{tarefa.titulo}</td>
                      <td>{formatarData(tarefa.data)}</td>
                      <td>{tarefa.estado}</td>
                      <td>{tarefa.criador_email}</td>
                      <td>{tarefa.operador_nome || 'N/A'}</td>
                      <td>

                        <button
                          className="btn-exportar-individual"
                          onClick={() => exportarTarefaIndividual(tarefa)}
                        >
                          Exportar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mapa-container">
          <h2>Mapa de Tarefas Concluídas</h2>
          <MapContainer
            center={[-15.7797, -47.9297]}
            zoom={4}
            style={{ height: '500px', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {tarefasFiltradas.map(tarefa => (
              <Marker
                key={`marker-${tarefa.id}`}
                position={[tarefa.latitude, tarefa.longitude]}
              >
                <Popup>
                  <strong>{tarefa.titulo}</strong><br />
                  Operador: {tarefa.operador_nome || 'N/A'}<br />
                  Data: {formatarData(tarefa.data)}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </main>
    </div>
  );
}
