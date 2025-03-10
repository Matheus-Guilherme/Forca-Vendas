import oracledb from 'oracledb';

export default {
  async findByCPF(cpf: string) {
    const connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
    });

    const result = await connection.execute(
      `SELECT codven as "CODIGO", nome as "NOME", senhaapp as "PASSWORD" FROM nuvem.v_usuario_app WHERE cpfven = :cpf`,
      [cpf]
    );

    await connection.close();

    // Faz uma type assertion para garantir que result.rows é um array
    const rows = result.rows as [string, string, string][] | undefined;

    if (!rows || rows.length === 0) {
      throw new Error('Usuário não encontrado.');
    }

    // Converte o array de valores para um objeto com propriedades nomeadas
    const user = {
      ID: rows[0][0],
      NOME: rows[0][1],
      PASSWORD: rows[0][2],
    };

    console.log(user);

    return user;
  },
};