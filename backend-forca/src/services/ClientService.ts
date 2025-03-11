import ClientRepository from '../repositories/ClientRepository';

export default {
  async authenticate(id: string, page: number, search: string) {
    try {
      const { clientes, hasMore } = await ClientRepository.getByVend(id, page, 50, search);
      return { clientes, hasMore };
    } catch (error) {
      console.error('Erro no ClientService:', error);
      throw new Error('Erro ao buscar clientes');
    }
  },
};