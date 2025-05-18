export function validarCad(form, rgFrente, rgVerso, fotoRostoRg, setErrors, step) {
  const newErrors = {};
  
  // Validação do passo 1
  if (step === 1) {
    if (!form.nome?.trim()) newErrors.nome = "Nome é obrigatório.";
    if (!form.email?.trim()) newErrors.email = "Email é obrigatório.";
    if (!form.senha?.trim()) newErrors.senha = "Senha é obrigatória.";
  }

  // Validação do passo 2
  if (step === 2) {
    if (!form.cpf?.trim()) newErrors.cpf = "CPF é obrigatório.";
    if (!form.estado?.trim()) newErrors.estado = "Estado é obrigatório.";
    if (!form.cidade?.trim()) newErrors.cidade = "Cidade é obrigatória.";
  }

  // Validação do passo 3
  if (step === 3) {
    if (!rgFrente) newErrors.rgFrente = "Foto da frente do RG é obrigatória.";
    if (!rgVerso) newErrors.rgVerso = "Foto do verso do RG é obrigatória.";
    if (!fotoRostoRg) newErrors.fotoRostoRg = "Foto segurando RG é obrigatória.";
  }

  // Atualiza os erros apenas se setErrors for uma função
  if (typeof setErrors === 'function') {
    setErrors(newErrors);
  }

  return Object.keys(newErrors).length === 0;
}