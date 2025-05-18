import { showToast } from "./toastUtils";

export function nextStepValidation(step, form) {
  console.log("Validação do passo:", step);
  console.log("Dados do formulário:", form);

  if (
    step === 1 &&
    (!form.nome?.trim() || !form.email?.trim() || !form.senha?.trim())
  ) {
    showToast("warning", "é o cpf");
    return false;
  }

  if (step === 2) {
    // Remove formatação do CPF para validação
    const cpfNumerico = form.cpf?.replace(/\D/g, "") || "";
    console.log("CPF formatado:", cpfNumerico);

    if (cpfNumerico.length !== 11) {
      showToast("warning", "CPF deve conter 11 dígitos.");
      return false;
    }

    if (!form.estado?.trim()) {
      showToast("warning", "Selecione um estado.");
      return false;
    }

    if (!form.cidade?.trim()) {
      showToast("warning", "Selecione uma cidade.");
      return false;
    }
  }

  return true;
}

export function nextStep(step, setStep) {
  setStep((prev) => Math.min(prev + 1, 3));
}

export function prevStep(setStep) {
  setStep((prev) => Math.max(prev - 1, 1));
}
