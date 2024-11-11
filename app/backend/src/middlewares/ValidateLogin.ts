import { NextFunction, Request, Response } from 'express';
import jwtUtil from '../Utils/jwtUtil';
import UserModel from '../database/models/UsersModel';

interface DecodedToken {
  email: string;
}

async function validateToken(req: Request, res: Response, next: NextFunction) {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: 'Token not found' });
  }

  const token = authorization.split(' ')[1];

  try {
    const decoded = await jwtUtil.verify(token) as DecodedToken;
    const user = await UserModel.findOne({ where: { email: decoded.email } });
    if (!user) {
      return res.status(401).json({ message: 'Token must be a valid token' });
    }
    req.headers = { role: user.role };
    next();
  } catch (error) {
    console.log('Token verification error:', error);
    res.status(401).json({ message: 'Token must be a valid token' });
  }
}

export default validateToken;
