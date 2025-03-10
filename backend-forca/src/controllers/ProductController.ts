import { Request, Response } from 'express';
import ProductService from '../services/ProductService';

export default {
  async products(req: Request, res: Response) {
    const id = req.query.id as string;

    console.log(id);
        
    try {
      const products = await ProductService.authenticate(id);
      res.json({ success: true, products });
    } catch (error) {
      res.status(401).json({ success: false, message: 'Erro ao buscar produtos'});
    }
  },
};