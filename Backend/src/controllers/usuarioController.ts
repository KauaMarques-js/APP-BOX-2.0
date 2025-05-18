import { Request, Response } from 'express';
import { Usuario } from '../types/Usuario';
import { getAllAsync, runAsync } from '../utils/dbUtils';

// Listar usuários
export const listarUsuarios = async (_req: Request, res: Response) => {
  try {
    const usuarios = await getAllAsync<Omit<Usuario, 'senha'>>(
      `SELECT id, nome, email, role, cpf, rg_frente, rg_verso FROM usuarios`
    );
    return res.json(usuarios);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao buscar usuários" });
  }
};

// Atualizar role de usuário
export const atualizarRole = async (req: Request, res: Response) => {
  const { role } = req.body;
  const { id } = req.params;

  if (!role || !["operador", "empresa", "admin"].includes(role)) {
    return res.status(400).json({ error: "Tipo de usuário não reconhecido." });
  }

  try {
    await runAsync('UPDATE usuarios SET role = ? WHERE id = ?', [role, id]);
    return res.json({ message: 'Role atualizada' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// Excluir usuário
export const excluirUsuario = async (req: Request, res: Response) => {
  try {
    await runAsync('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
    return res.json({ message: 'Usuário excluído com sucesso.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
