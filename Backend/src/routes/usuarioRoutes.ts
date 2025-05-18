import express from 'express';
import { listarUsuarios, atualizarRole, excluirUsuario } from '../controllers/usuarioController';


const router = express.Router();




router.get('/usuarios', listarUsuarios);
router.put('/usuarios/:id/role', atualizarRole);
router.delete('/usuarios/:id', excluirUsuario);

export default router