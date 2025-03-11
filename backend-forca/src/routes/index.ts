import { Router } from 'express';
import UserController from '../controllers/UserController';
import ClientController from '../controllers/ClientController';
import ProductController from '../controllers/ProductController';

const router = Router();

router.post('/login', UserController.login);

router.get('/clients', ClientController.clients);

router.get('/products', ProductController.products);

export default router;