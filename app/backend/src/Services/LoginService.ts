import { compareSync } from 'bcryptjs';
import { ServiceResponse } from '../Interfaces/ServiceResponse';
import { Login, Token } from '../types/login';
import UserModel from '../database/models/UsersModel';
import jwtUtil from '../Utils/jwtUtil';

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
const invalidData = 'Invalid email or password';

async function verifyLogin(login: Login): Promise<ServiceResponse<Token>> {
  if (!login.email || !login.password) {
    return { status: 'INVALID_DATA', data: { message: 'All fields must be filled' } };
  }
  if (login.password.length < 6) {
    return { status: 'UNAUTHORIZED', data: { message: invalidData } };
  }
  if (!isValidEmail(login.email)) {
    return { status: 'UNAUTHORIZED', data: { message: invalidData } };
  }

  const foundUser = await UserModel.findOne({ where: { email: login.email } });

  if (!foundUser || !compareSync(login.password, foundUser.dataValues.password)) {
    return { status: 'UNAUTHORIZED', data: { message: invalidData } };
  }

  const { id, email } = foundUser.dataValues;
  const token = jwtUtil.sign({ id, email });
  return { status: 'SUCCESSFUL', data: { token } };
}
export default {
  verifyLogin,
};
