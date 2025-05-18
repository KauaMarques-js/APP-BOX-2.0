import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import Header from "../components/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { validarCad } from "./utils/ValidarCad";
import { formatarCPF } from "./utils/FormartarCpf";
import { showToast } from "./utils/toastUtils";
import { nextStepValidation, nextStep, prevStep } from "./utils/StepCad";
import { estadosECidades } from "./utils/estadosECidades";

import SelectField from "./ui/SelectField";
import FileUploadField from "./ui/FileUploadField";
import StepIndicator from "./ui/StepIndicator";

function Cadastro() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    cpf: "",
    estado: "",
    cidade: "",
  });

  const [errors, setErrors] = useState({});
  const [rgFrente, setRgFrente] = useState(null);
  const [rgVerso, setRgVerso] = useState(null);
  const [fotoRostoRg, setFotoRostoRg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const navigate = useNavigate();

  const handleCadastro = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    if (step !== 3) {
      showToast("warning", "Complete todos os passos antes de cadastrar.");
      setLoading(false);
      return;
    }
  
    const isValid = validarCad(form, rgFrente, rgVerso, fotoRostoRg, setErrors, step);
    if (!isValid) {
      showToast("warning", "Preencha todos os campos corretamente.");
      setLoading(false);
      return;
    }  

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    formData.append("rg_frente", rgFrente);
    formData.append("rg_verso", rgVerso);
    formData.append("foto_rosto_rg", fotoRostoRg);

    try {
      await api.post("/register", formData, { headers: { "Content-Type": "multipart/form-data" } });
      showToast("success", "Usuário cadastrado com sucesso!", {
        autoClose: 2000,
        onClose: () => navigate("/login"),
      });
    } catch (error) {
      const msg = error.response?.data?.error || "Erro ao conectar com o servidor.";
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (!nextStepValidation(step, form)) {
      showToast("warning", "Preencha os campos necessários antes de avançar.");
      return;
    }
    nextStep(step, setStep);
  };

  const handlePrevStep = () => {
    prevStep(setStep);
  };

  return (
    <div>
      <Header />
      <ToastContainer />
      <div className="page-center">
        <div className="form-card">
          <h1>Cadastro</h1>
          <StepIndicator currentStep={step} />

          <form onSubmit={handleCadastro}>
            {step === 1 && (
              <>
                <div>
                  <label>Nome Completo</label>
                  <input
                    type="text"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  />
                  {errors.nome && <span>{errors.nome}</span>}
                </div>

                <div>
                  <label>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                  {errors.email && <span>{errors.email}</span>}
                </div>

                <div>
                  <label>Senha</label>
                  <input
                    type="password"
                    value={form.senha}
                    onChange={(e) => setForm({ ...form, senha: e.target.value })}
                    minLength={6}
                  />
                  {errors.senha && <span>{errors.senha}</span>}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label>CPF</label>
                  <input
                    type="text"
                    value={form.cpf}
                    onChange={(e) => setForm({ ...form, cpf: formatarCPF(e.target.value) })}
                    maxLength={14}
                  />
                  {errors.cpf && <span>{errors.cpf}</span>}
                </div>

                <SelectField
                  label="Estado"
                  value={form.estado}
                  options={Object.keys(estadosECidades)}
                  onChange={(e) => setForm({ ...form, estado: e.target.value, cidade: "" })}
                  error={errors.estado}
                  placeholder="Selecione um Estado"
                />

                {form.estado && (
                  <SelectField
                    label="Cidade"
                    value={form.cidade}
                    options={estadosECidades[form.estado]}
                    onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                    error={errors.cidade}
                    placeholder="Selecione um Estado"
                  />
                )}
              </>
            )}

            {step === 3 && (
              <>
                <FileUploadField
                  label="RG Frente"
                  onChange={(e) => setRgFrente(e.target.files[0])}
                  error={errors.rgFrente}
                />

                <FileUploadField
                  label="RG Verso"
                  onChange={(e) => setRgVerso(e.target.files[0])}
                  error={errors.rgVerso}
                />

                <FileUploadField
                  label="Foto segurando RG"
                  onChange={(e) => setFotoRostoRg(e.target.files[0])}
                  error={errors.fotoRostoRg}
                />
              </>
            )}

            <div className="button-group">
              {step > 1 && (
                <button type="button" onClick={handlePrevStep}>
                  Voltar
                </button>
              )}
              {step < 3 ? (
                <button type="button" onClick={handleNextStep}>
                  Próximo
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className={loading ? "loading-button" : ""}
                >
                  {loading ? "Cadastrando..." : "Cadastrar"}
                </button>
              )}
            </div>
          </form>

          <p>
            Já possui login? <Link to="/login">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Cadastro;