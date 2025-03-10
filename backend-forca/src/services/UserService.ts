import UserRepository from '../repositories/UserRepository';
import bcrypt from 'bcrypt';

export default {
  async authenticate(cpf: string, password: string) {
    const user = await UserRepository.findByCPF(cpf);

    if (!user) {
      throw new Error('CPF ou senha incorretos.');
    }

    // Compara a senha fornecida com o hash armazenado
    console.log(cpf);
    const isPasswordValid = await bcrypt.compare(password, user.PASSWORD);

    if (!isPasswordValid) {
      throw new Error('CPF ou senha incorretos.');
    }
    return user;
  },
};