import oracledb from 'oracledb';

// Interface para tipar o retorno dos clientes
interface Cliente {
  CODIGO: string;
  CNPJ: string;
  RAZAOSOC: string;
  CONTATO: string;
  ENDERECO: string;
  CIDADE: string;
  TABELA: string;
  REAJUSTE: string;
}

export default {
  async getByClient(
    id: string,
    page: number = 1,
    limit: number = 50,
    search: string = ''
  ): Promise<{ clientes: Cliente[]; hasMore: boolean }> {
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

      // Query SQL com filtro de busca
      const query = `
        SELECT  c.codcli AS "CODIGO", 
                nuvem.f_formata_cnpj(MAX(c.cnpj)) AS "CNPJ", 
                MAX(c.razcli) AS "RAZAOSOC", 
                MAX(c.telefone) AS "CONTATO", 
                MAX(c.endend) || ', ' || MAX(c.numend) || ' - ' || MAX(c.baiend) AS "ENDERECO", 
                MAX(c.cidade) || '/' || MAX(c.estado) AS "CIDADE",
                MAX(r.destvs) AS "TABELA",
                MAX(r.rjttab) AS "REAJUSTE"
          FROM nuvem.v_clientes c
          LEFT JOIN ecapp.f010vcc t ON c.codcli = t.codcli
          LEFT JOIN ecapp.f011tve r ON t.codtvs = r.codtvs
          WHERE c.sitcli = 'A'
            AND c.codven = :id
            AND (UPPER(c.razcli) LIKE UPPER(:search) OR UPPER(c.codcli) LIKE UPPER(:search))
          GROUP BY c.codcli
          ORDER BY c.codcli, MAX(c.razcli)
          OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
      `;

      // Executa a query com paginação e filtro de busca
      const result = await connection.execute(query, {
        id: id,
        search: `%${search}%`, // Adiciona o parâmetro de busca
        offset: offset, // Offset para paginação
        limit: limit, // Limite de registros por página
      });

      // Faz uma type assertion para garantir que result.rows é um array
      const rows = result.rows as [string, string, string, string, string, string, string, string][] | undefined;

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
        TABELA: row[6],
        REAJUSTE: row[7]
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