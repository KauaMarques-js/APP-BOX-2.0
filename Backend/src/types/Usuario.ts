export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
  role: string;
  cpf: string;
  estado: string;
  cidade: string;
  rg_frente: string | null;
  rg_verso: string | null;
  foto_rosto_rg: string | null;
}
