import oracledb from 'oracledb';

// Interface para tipar o retorno dos clientes
interface Cliente {
  CODIGO: string;
  CNPJ: string;
  RAZAOSOC: string;
  CONTATO: string;
  ENDERECO: string;
  CIDADE: string;
}

export default {
  async getByVend(id: string, page: number = 1, limit: number = 50): Promise<{ clientes: Cliente[]; hasMore: boolean }> {
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
        `SELECT codcli as "CODIGO", 
                nuvem.f_formata_cnpj(cnpj) as "CNPJ", 
                razcli as "RAZAOSOC", 
                telefone as "CONTATO", 
                endend||', '||numend||' - '||baiend as "ENDERECO", 
                cidade||'/'||estado as "CIDADE" 
            FROM nuvem.v_clientes 
          WHERE codven = :id
            AND sitcli = 'A'
          ORDER BY codcli, razcli
          OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
        {
          id: id,
          offset: offset, // Offset para paginação
          limit: limit, // Limite de registros por página
        }
      );

      // Faz uma type assertion para garantir que result.rows é um array
      const rows = result.rows as [string, string, string, string, string, string][] | undefined;

      // Verifica se há resultados
      if (!rows || rows.length === 0) {
        return { clientes: [], hasMore: false }; // Retorna array vazio e indica que não há mais dados
      }

      // Converte o array de valores para um array de objetos com propriedades nomeadas
      const clientes: Cliente[] = rows.map(row => ({
        CODIGO: row[0],
        CNPJ: row[1],
        RAZAOSOC: row[2],
        CONTATO: row[3],
        ENDERECO: row[4],
        CIDADE: row[5],
      }));

      console.log('Clientes encontrados:', clientes);

      // Verifica se há mais dados para carregar
      const hasMore = rows.length === limit; // Se o número de registros for igual ao limite, há mais dados

      return { clientes, hasMore };
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      throw new Error('Erro ao buscar clientes no banco de dados.');
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