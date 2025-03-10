import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes'

dotenv.config();

const app = express();

// Middlewares
app.use(cors()); // Habilita CORS
app.use(express.json()); // Parseia JSON no corpo das requisições

app.use(routes);

export default app;