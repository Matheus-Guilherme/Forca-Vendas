import { Request, Response } from 'express';
import UserService from '../services/UserService';

export default {
  async login(req: Request, res: Response) {
    const { cpf, password } = req.body as { cpf: string; password: string; };
    
    try {
      const user = await UserService.authenticate(cpf, password);
      res.json({ success: true, user });
    } catch (error) {
      res.status(401).json({ success: false, message: 'Senha incorreta.'});
    }
  },
};