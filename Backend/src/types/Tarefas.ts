export interface Tarefa {
  id: number;
  titulo: string;
  descricao: string;
  latitude: number;
  longitude: number;
  data: string;
  estado: string;
  criador_id: number;

  confirmado?: boolean;
  operador_id?: number | null;
  operador_presente?: number;
  justificativa_cancelamento?: string | null;
  ativa?: number;  
}
