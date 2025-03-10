import ProductRepository from '../repositories/ProductRepository';

export default {
  async authenticate(id: string) {
    const products = await ProductRepository.getproduct(id);

    if (!products) {
      throw new Error('Não foi possivel buscar os produtos');
    }

    return products;
  },
};