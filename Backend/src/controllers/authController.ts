import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { Usuario } from '../types/Usuario';
import { getAsync, runAsync } from '../utils/dbUtils';

// Registro de usuário
export const register = async (req: Request, res: Response) => {
  try {
    const { nome, email, senha, cpf, estado, cidade, role = 'operador' } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const rg_frente = files?.rg_frente ? files.rg_frente[0].filename : null;
    const rg_verso = files?.rg_verso ? files.rg_verso[0].filename : null;
    const foto_rosto_rg = files?.foto_rosto_rg ? files.foto_rosto_rg[0].filename : null;

    if (!nome || !email || !senha || !cpf || !estado || !cidade || !rg_frente || !rg_verso || !foto_rosto_rg) {
      return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
    }

    const emailExistente = await getAsync<{ id: number }>('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (emailExistente) {
      return res.status(400).json({ error: "E-mail já cadastrado." });
    }

    const cpfExistente = await getAsync<{ id: number }>('SELECT id FROM usuarios WHERE cpf = ?', [cpf]);
    if (cpfExistente) {
      return res.status(400).json({ error: "Usuário já cadastrado." });
    }

    const hashedSenha = bcrypt.hashSync(senha, 10);

    await runAsync(
      `INSERT INTO usuarios 
        (nome, email, senha, role, cpf, estado, cidade, rg_frente, rg_verso, foto_rosto_rg)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, email, hashedSenha, role, cpf, estado, cidade, rg_frente, rg_verso, foto_rosto_rg]
    );

    return res.status(201).json({ message: "Usuário registrado com sucesso!" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro no servidor." });
  }
};

// Login de usuário
export const login = async (req: Request, res: Response) => {
  const { email, senha } = req.body;

  try {
    const usuario = await getAsync<Usuario>('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (!usuario) return res.status(401).json({ erro: 'E-mail não encontrado' });

    const senhaCorreta = bcrypt.compareSync(senha, usuario.senha);
    if (!senhaCorreta) return res.status(401).json({ erro: 'Senha incorreta' });

    const { senha: _, ...usuarioSemSenha } = usuario;
    return res.json(usuarioSemSenha);

  } catch (err: any) {
    console.error('Erro no login:', err);
    return res.status(500).json({ erro: 'Erro no servidor' });
  }
};
