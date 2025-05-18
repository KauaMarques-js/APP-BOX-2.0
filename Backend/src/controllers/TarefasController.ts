import { Request, Response } from 'express';
import { runAsync, getAsync, getAllAsync } from '../utils/dbUtils';
import { Tarefa } from '../types/Tarefas';

export const cadastrarTarefa = async (req: Request, res: Response): Promise<Response> => {
  const { titulo, descricao, latitude, longitude, data, estado, criador_id } = req.body;

  const erros: string[] = [];
  if (!titulo) erros.push("Título é obrigatório");
  if (!descricao) erros.push("Descrição é obrigatória");
  if (latitude === undefined || isNaN(Number(latitude))) erros.push("Latitude inválida");
  if (longitude === undefined || isNaN(Number(longitude))) erros.push("Longitude inválida");
  if (!data) erros.push("Data é obrigatória");
  if (!estado) erros.push("Estado é obrigatório");
  if (!criador_id || isNaN(Number(criador_id))) erros.push("ID do criador é obrigatório");

  if (erros.length > 0) {
    return res.status(400).json({ mensagem: "Dados inválidos", erros });
  }

  try {
    await runAsync(
      `INSERT INTO tarefas (titulo, descricao, latitude, longitude, data, estado, criador_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [titulo, descricao, Number(latitude), Number(longitude), data, estado, Number(criador_id)]
    );

    const result = await getAsync<{ lastID: number }>("SELECT last_insert_rowid() as lastID");
    if (!result) throw new Error("Não foi possível obter o ID da tarefa inserida");

    return res.status(201).json({ mensagem: "Tarefa cadastrada com sucesso", id: result.lastID });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
    return res.status(500).json({ mensagem: "Erro interno ao cadastrar tarefa", erro: errorMessage });
  }
};

export const listarTarefas = async (req: Request, res: Response): Promise<Response> => {
  const { estado, criador_id, operador_id } = req.query;

  try {
    let query = `
      SELECT t.*, u.nome as operador_nome, u.cpf as operador_cpf 
      FROM tarefas t
      LEFT JOIN usuarios u ON t.operador_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (estado) {
      query += " AND t.estado = ?";
      params.push(estado);
    }

    if (criador_id) {
      query += " AND t.criador_id = ?";
      params.push(Number(criador_id));
    }

    if (operador_id) {
      query += " AND (t.operador_id IS NULL OR t.operador_id = ?)";
      params.push(Number(operador_id));
    }

    const tarefas = await getAllAsync<Tarefa>(query, params);
    return res.json(tarefas);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
    return res.status(500).json({ mensagem: "Erro interno ao listar tarefas", erro: errorMessage });
  }
};

export const atualizarTarefa = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const novosDados = req.body;

  try {
    const tarefaExistente = await getAsync<Tarefa>("SELECT * FROM tarefas WHERE id = ?", [id]);
    if (!tarefaExistente) {
      return res.status(404).json({ mensagem: "Tarefa não encontrada" });
    }

    // Merge dos dados existentes com os novos dados enviados
    const tarefaAtualizada = { ...tarefaExistente, ...novosDados };

    await runAsync(
      `UPDATE tarefas SET 
        titulo = ?, 
        descricao = ?, 
        data = ?, 
        estado = ?, 
        confirmado = ?, 
        operador_id = ?, 
        operador_presente = ?, 
        justificativa_cancelamento = ?, 
        ativa = ?
      WHERE id = ?`,
      [
        tarefaAtualizada.titulo,
        tarefaAtualizada.descricao,
        tarefaAtualizada.data,
        tarefaAtualizada.estado,
        tarefaAtualizada.confirmado ?? 0,
        tarefaAtualizada.operador_id ?? null,
        tarefaAtualizada.operador_presente ?? 0,
        tarefaAtualizada.justificativa_cancelamento ?? null,
        tarefaAtualizada.ativa ?? 1,
        id
      ]
    );

    return res.json({ mensagem: "Tarefa atualizada com sucesso!" });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
    return res.status(500).json({ mensagem: "Erro ao atualizar tarefa", erro: errorMessage });
  }
};

// Confirmar presença do operador na tarefa
export const concluirTarefa = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { operador_id } = req.body;

  if (!operador_id || isNaN(Number(operador_id))) {
    return res.status(400).json({ mensagem: "ID do operador é obrigatório." });
  }

  try {
    const tarefaExistente = await getAsync<Tarefa>("SELECT * FROM tarefas WHERE id = ?", [id]);
    if (!tarefaExistente) return res.status(404).json({ mensagem: "Tarefa não encontrada" });

    if (tarefaExistente.operador_id && tarefaExistente.operador_id !== Number(operador_id)) {
      // Se operador diferente já confirmou, bloqueia
      return res.status(400).json({ mensagem: "Esta tarefa já possui operador confirmado." });
    }

    // Caso a tarefa já esteja confirmada pelo mesmo operador, permite só retornar sucesso
    if (tarefaExistente.operador_id === Number(operador_id) && tarefaExistente.operador_presente === 1) {
      return res.json({ mensagem: "Presença já confirmada.", tarefaAtualizada: tarefaExistente });
    }

    // Atualiza para presença confirmada pelo operador
    await runAsync(
      `UPDATE tarefas SET operador_presente = 1, operador_id = ?, justificativa_cancelamento = NULL WHERE id = ?`,
      [operador_id, id]
    );

    return res.json({ mensagem: "Presença confirmada com sucesso!", tarefaAtualizada: { id, operador_id, operador_presente: 1 } });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
    return res.status(500).json({ mensagem: "Erro ao confirmar presença", erro: errorMessage });
  }
};

// Cancelar presença do operador (só se ele for o operador que confirmou)
export const cancelarPresenca = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { operador_id, motivo } = req.body;

  // Validações de entrada
  if (!operador_id || isNaN(Number(operador_id))) {
    return res.status(400).json({ mensagem: "ID do operador é obrigatório." });
  }

  if (!motivo || motivo.trim() === "") {
    return res.status(400).json({ mensagem: "Motivo do cancelamento é obrigatório." });
  }

  try {
    // Verifica se a tarefa existe
    const tarefaExistente = await getAsync<Tarefa>(
      "SELECT * FROM tarefas WHERE id = ?", 
      [id]
    );
    
    if (!tarefaExistente) {
      return res.status(404).json({ mensagem: "Tarefa não encontrada" });
    }

    // Verifica permissões
    if (tarefaExistente.operador_id !== Number(operador_id)) {
      return res.status(403).json({ 
        mensagem: "Você não pode cancelar presença de uma tarefa que não confirmou." 
      });
    }

    // Query corrigida sem comentários inválidos
    await runAsync(
      `UPDATE tarefas 
       SET operador_presente = 0, 
           justificativa_cancelamento = ?, 
           operador_id = NULL,
           ativa = 0
       WHERE id = ?`,
      [motivo.trim(), id]
    );

    return res.json({ 
      mensagem: "Presença cancelada com sucesso.",
      dados: {
        id: Number(id),
        operador_presente: 0,
        operador_id: null,
        ativa: 0
      }
    });

  } catch (err: unknown) {
    console.error("Erro no cancelamento:", err);
    return res.status(500).json({ 
      mensagem: "Erro interno ao cancelar presença",
      detalhes: err instanceof Error ? err.message : JSON.stringify(err)
    });
  }
};
export const reativarTarefa = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  try {
    const tarefaExistente = await getAsync<Tarefa>("SELECT * FROM tarefas WHERE id = ?", [id]);
    if (!tarefaExistente) return res.status(404).json({ mensagem: "Tarefa não encontrada" });

    await runAsync(
      `UPDATE tarefas 
       SET ativa = 1, operador_presente = 0, justificativa_cancelamento = NULL, operador_id = NULL 
       WHERE id = ?`,
      [id]
    );

    return res.json({ mensagem: "Tarefa reativada com sucesso." });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
    return res.status(500).json({ mensagem: "Erro ao reativar tarefa", erro: errorMessage });
  }
};

export async function listarTarefasConcluidas(_: Request, res: Response) {
  try {
    const tarefas = await getAllAsync(`
      SELECT t.*, 
             criador.email AS criador_email, criador.cpf AS criador_cpf,
             operador.nome AS operador_nome, operador.cpf AS operador_cpf
      FROM tarefas t
      JOIN usuarios criador ON t.criador_id = criador.id
      LEFT JOIN usuarios operador ON t.operador_id = operador.id
      WHERE t.confirmado = 1
    `);

    res.json(tarefas);
  } catch (error) {
    console.error('Erro ao buscar tarefas concluídas:', error);
    res.status(500).json({ erro: 'Erro ao buscar tarefas concluídas' });
  }
}
