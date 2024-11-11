import { Request, Response } from 'express';
import loginService from '../Services/LoginService';
import mapStatus from '../Utils/MapStatus';

async function login(req: Request, res: Response) {
  const serviceResponse = await loginService.verifyLogin(req.body);

  if (serviceResponse.status !== 'SUCCESSFUL') {
    return res.status(mapStatus(serviceResponse.status)).json(serviceResponse.data);
  }

  res.status(200).json(serviceResponse.data);
}
async function getRole(req: Request, res: Response) {
  const user = req.headers;

  res.status(200).json({ role: user.role });
}
export default {
  login,
  getRole,
};
