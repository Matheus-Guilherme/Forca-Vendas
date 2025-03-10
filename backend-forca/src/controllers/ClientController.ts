import { Request, Response } from 'express';
import ClientService from '../services/ClientService';

export default {
  async clients(req: Request, res: Response) {
    const id = req.query.id as string;

    console.log(id);
        
    try {
      const user = await ClientService.authenticate(id);
      res.json({ success: true, user });
    } catch (error) {
      res.status(401).json({ success: false, message: 'Erro ao buscar clientes'});
    }
  },
};