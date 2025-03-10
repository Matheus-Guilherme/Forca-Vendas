import express, { Request, Response } from 'express';
import oracledb from 'oracledb';
import cors from 'cors';
import 'dotenv/config'

const app = express();
const port = 3000;

// Middleware para parsear JSON
app.use(express.json());
// Habilita CORS para todas as rotas
app.use(cors()); 


// Rota de teste
app.get('/', (req: Request, res: Response) => {
  res.send('API está funcionando!');
});

// Rota para buscar dados do Oracle
app.get('/users', async (req: Request, res: Response) => {
  let connection;

  try {
    // Conecta ao banco de dados Oracle
    connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING, // Ajuste a string de conexão
    });

    // Executa uma consulta
    const result = await connection.execute("SELECT nome, cpfven, senha FROM nuvem.usuarios WHERE ativo = 'S' ");
    res.json(result.rows); // Retorna os dados como JSON
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar dados' });
  } finally {
    if (connection) {
      try {
        await connection.close(); // Fecha a conexão
      } catch (err) {
        console.error(err);
      }
    }
  }
});

// Rota para fazer o login
app.post('/login', async (req:any, res: any) => {
  const { cpf, senha } = req.body as { cpf: string; senha: string; };

  if (!cpf || !senha) {
    return res.status(400).json({ success: false, message: 'CPF e Senha são obrigatórios.', cadastro: cpf, password: senha });
  }

  let connection;

  try {
    // Conecta ao banco de dados Oracle
    connection = await oracledb.getConnection({
      user: 'ECAPP',
      password: 'ECAPP3115SENHABD',
      connectString: '192.168.2.10:1521/Oracle',
    });

    // Consulta o banco de dados para verificar o usuário
    const result = await connection.execute<{ NOME: string; SENHA: string; }>(
      `SELECT nome as "NOME", senhaapp as "SENHA" FROM nuvem.usuarios WHERE cpfven = :cpf AND ativo = 'S'`,
      [cpf], // Parâmetros como array
      { outFormat: oracledb.OUT_FORMAT_OBJECT } // Retorna os resultados como objetos
    );

      // Verifica se o usuário foi encontrado
    if (result.rows && result.rows.length > 0) {
      const user = result.rows[0]; // Primeira linha do resultado
      const storedPassword = user.SENHA; // Senha
      const userName = user.NOME; // Nome

      // Compara a senha fornecida com a senha armazenada
      if (senha === storedPassword) {
        // Senha correta
        return res.json({ success: true, message: 'Login bem-sucedido!', user: { nome: userName } });
      } else {
        // Senha incorreta
        return res.status(401).json({ success: false, message: 'Senha incorreta.' });
      }
    }
      else {
        // Usuário não encontrado
        return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Erro no servidor.' });
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (error) {
          console.error(error);
        }
      }
    }
});

app.post('/teste', async (req: any, res: any) => {
  return res.status(404).json({success: false, message: 'Deu certo, chegou na rota'});
});


// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});