import express from 'express';
import { 
  cadastrarTarefa, 
  listarTarefas, 
  atualizarTarefa, 
  concluirTarefa,
  cancelarPresenca,
  reativarTarefa, 
  listarTarefasConcluidas
} from '@/controllers/TarefasController';

const router = express.Router();

router.post('/', cadastrarTarefa);
router.get('/', listarTarefas);
router.put('/:id', atualizarTarefa);
router.put('/:id/concluir', concluirTarefa);
router.put('/:id/cancelar', cancelarPresenca);
router.put('/:id/reativar', reativarTarefa);  
router.get('/concluidas', listarTarefasConcluidas);
export default router;
