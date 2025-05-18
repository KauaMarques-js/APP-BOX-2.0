import React, { useState, useEffect } from "react";
import Header from "../../components/Header.jsx";
import api from "../../services/api.js";
import { useNavigate } from "react-router-dom";
import MapPicker from "../../components/Maps/MapPicker.jsx";
import { estadosECidades } from "../../Auth/utils/estadosECidades.js";
import SelectField from "../../Auth/ui/SelectField.jsx";

export default function PainelEmpresa() {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [data, setData] = useState("");
  const [estado, setEstado] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem("authData") || "{}");

    if (!authData.isLogged || authData.role !== "empresa") {
      navigate("/login");
    }
  }, [navigate]);

  const cadastrarTarefa = async (e) => {
    e.preventDefault();
    setLoading(true);

    const authData = JSON.parse(localStorage.getItem("authData") || "{}");
    const criador_id = authData.id;

    if (!criador_id) {
      alert("Sessão expirada. Faça login novamente.");
      navigate("/login");
      setLoading(false);
      return;
    }

    const erros = [];
    if (!titulo) erros.push("Título é obrigatório");
    if (!descricao) erros.push("Descrição é obrigatória");
    if (!estado) erros.push("Estado é obrigatório");
    if (!data) erros.push("Data é obrigatória");
    if (latitude === null || longitude === null)
      erros.push("Selecione um local no mapa");

    if (erros.length > 0) {
      alert(erros.join("\n"));
      setLoading(false);
      return;
    }

    const novaTarefa = {
      titulo,
      descricao,
      estado,
      latitude: Number(latitude),
      longitude: Number(longitude),
      data: new Date(data).toISOString().split("T")[0],
      criador_id: Number(criador_id),
    };

    try {
      const response = await api.post("/tarefas", novaTarefa, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      });

      if (response.status === 201) {
        alert("Tarefa cadastrada com sucesso!");
        setTitulo("");
        setDescricao("");
        setLatitude(null);
        setLongitude(null);
        setData("");
        setEstado("");
      }
    } catch (erro) {
      console.error("Erro no cadastro:", erro.response?.data || erro);

      let mensagem = "Erro ao cadastrar tarefa";
      if (erro.response?.data?.erros) {
        mensagem = erro.response.data.erros.join("\n");
      } else if (erro.response?.data?.message) {
        mensagem = erro.response.data.message;
      }

      alert(mensagem);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />

      <main className="container fade-in">
        <h1 className="page-title">Painel da Empresa</h1>

        <form onSubmit={cadastrarTarefa} className="card-form">
          <label htmlFor="titulo" className="label">
            Título:
          </label>
          <input
            id="titulo"
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            className="input"
            placeholder="Digite o título da tarefa"
          />

          <label htmlFor="descricao" className="label">
            Descrição:
          </label>
          <textarea
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            required
            className="textarea"
            placeholder="Descreva a tarefa"
          ></textarea>

          <label htmlFor="estado" className="label">
            Selecione o Estado:
          </label>
          <SelectField
            id="estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            options={Object.keys(estadosECidades)}
            placeholder="Selecione um Estado"
          />

          <label className="label">Selecione o Local no Mapa:</label>
          <MapPicker
            onLocationSelected={(lat, lng) => {
              setLatitude(lat);
              setLongitude(lng);
            }}
          />
          {latitude !== null && longitude !== null && (
            <p>
              Local selecionado: {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </p>
          )}

          <label htmlFor="data" className="label">
            Data de Execução:
          </label>
          <input
            id="data"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
            className="date-input"
            min={new Date().toISOString().split("T")[0]}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar Tarefa"}
          </button>
        </form>
      </main>
    </div>
  );
}
