import express from 'express';
import { login, register } from '../controllers/authController';
import { upload } from '../config/uploads';

const router = express.Router();

router.post('/register', upload.fields([
  { name: 'rg_frente', maxCount: 1 },
  { name: 'rg_verso', maxCount: 1 },
  { name: 'foto_rosto_rg', maxCount: 1 } 
]), register);

router.post('/login', login);

export default router