import ClientRepository from '../repositories/ClientRepository';

export default {
  async authenticate(id: string) {
    const user = await ClientRepository.getByVend(id);

    if (!user) {
      throw new Error('Não foi possivel buscar os clientes');
    }

    return user;
  },
};