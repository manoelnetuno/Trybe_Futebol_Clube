import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

const secret = 'jwt_secret';

function extractToken(authorization: string): string {
  return authorization.split(' ')[1];
}

const authMiddleware = (req: Request, res: Response, next: NextFunction): Response | void => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: 'Token not found' });
  }

  const token = extractToken(authorization);

  try {
    jwt.verify(token, secret);
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token must be a valid token' });
  }
};

export default authMiddleware;
