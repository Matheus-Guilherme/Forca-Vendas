import oracledb from 'oracledb';

// Interface para tipar o retorno dos produtos
interface Product {
  CODIGO: string;
  DESCRICAO: string;
  UNIDADE: string;
  FAMILIA: string;
  ESTOQUE: string;
  PRECO: string;
}

export default {
  async getproduct(id: string, 
                   page: number = 1, 
                   limit: number = 50): Promise<{ itens: Product[]; hasMore: boolean }> {
    
    let connection;

    try {
      // Conecta ao banco de dados
      connection = await oracledb.getConnection({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        connectString: process.env.DB_CONNECT_STRING,
      });

      // Calcula o offset com base na página e no limite
      const offset = (page - 1) * limit;

      // Executa a query com paginação
      const result = await connection.execute(
        `SELECT codpro "CODIGO",
                despro "DESCRICAO",
                undpro "UNIDADE",
                desfam "FAMILIA",
                estpro "ESTOQUE",
                nuvem.f_formatanumerico(prcven,'D') "PRECO"
            FROM NUVEM.V_PRODUTOS t 
          WHERE sitpro = 'A'
            AND rownum <= 15`
      );

      // Faz uma type assertion para garantir que result.rows é um array
      const rows = result.rows as [string, string, string, string, string, string][] | undefined;

      // Verifica se há resultados
      if (!rows || rows.length === 0) {
        return { itens: [], hasMore: false }; // Retorna array vazio e indica que não há mais dados
      }

      // Converte o array de valores para um array de objetos com propriedades nomeadas
      const itens: Product[] = rows.map(row => ({
        CODIGO: row[0],
        DESCRICAO: row[1],
        UNIDADE: row[2],
        FAMILIA: row[3],
        ESTOQUE: row[4],
        PRECO: row[5],
      }));

      console.log('Produtos encontrados:', itens);

      // Verifica se há mais dados para carregar
      const hasMore = rows.length === limit; // Se o número de registros for igual ao limite, há mais dados

      return { itens, hasMore };
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      throw new Error('Erro ao buscar produto no banco de dados.');
    } finally {
      // Fecha a conexão com o banco de dados
      if (connection) {
        try {
          await connection.close();
        } catch (error) {
          console.error('Erro ao fechar a conexão:', error);
        }
      }
    }
  },
};