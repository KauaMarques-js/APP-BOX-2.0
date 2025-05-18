import express, { Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import usuarioRoutes from './routes/usuarioRoutes';
import tarefaRoutes from './routes/tarefaRoutes'; 

const app = express();
app.use(cors());
app.use(express.json());

app.use(authRoutes);
app.use(usuarioRoutes);
app.use("/tarefas", tarefaRoutes); 

// 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
