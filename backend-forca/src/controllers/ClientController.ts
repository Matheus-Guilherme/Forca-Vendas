import { Request, Response } from 'express';
import ClientService from '../services/ClientService';


export default {
  async clients(req: Request, res: Response) {
    const id = req.query.id as string;
    const page = parseInt(req.query.page as string) || 1;
    const search = req.query.search as string || '';

    // Debug 
    console.log('Parâmetros recebidos:', { id, page, search });

    try {
      const user = await ClientService.authenticate(id, page, search);
      res.json({ success: true, user });
    } catch (error) {
      console.error('Erro no controller:', error);
      res.status(401).json({ success: false, message: 'Erro ao buscar clientes' });
    }
  },
};