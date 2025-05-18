export function formatarCPF(cpf) {
  return cpf
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d{1,3})/, "$1.$2")
    .replace(/(\d{3})(\d{1,3})/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
