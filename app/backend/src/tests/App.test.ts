import { Request, Response, NextFunction } from 'express';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as jwt from 'jsonwebtoken';
import validateToken from '../middlewares/authmiddlaware';

describe('Middleware validateToken', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: sinon.SinonStub;

  beforeEach(() => {
    req = {
      headers: {}, 
      body: {},
    };

    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };

    next = sinon.stub();
  });

  it('should return 401 if token is not provided', () => {
    validateToken(req as Request, res as Response, next);

    expect((res.status as sinon.SinonStub).calledWith(401)).to.be.true;
    expect((res.json as sinon.SinonStub).calledWith({ message: 'Token not found' })).to.be.true;
    expect((next as sinon.SinonStub).called).to.be.false;
  });

  it('should return 401 if token is invalid', () => {
    req.headers = {};
    req.headers.authorization = 'Bearer invalidToken';
    const verifyStub = sinon.stub(jwt, 'verify').throws(new Error('Invalid token'));

    validateToken(req as Request, res as Response, next);

    expect((res.status as sinon.SinonStub).calledWith(401)).to.be.true;
    expect((res.json as sinon.SinonStub).calledWith({ message: 'Token must be a valid token' })).to.be.true;
    expect((next as sinon.SinonStub).called).to.be.false;

    verifyStub.restore();
  });
});