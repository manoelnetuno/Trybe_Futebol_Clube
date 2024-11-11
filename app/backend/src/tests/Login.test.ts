import * as sinon from 'sinon';
import * as chai from 'chai';

// @ts-ignore
import chaiHttp = require('chai-http');
import { App } from '../app';
import { validLogin } from './mocks/LoginMocks';
import jwtUtil from '../Utils/jwtUtil';

chai.use(chaiHttp);

const { app } = new App();

const { expect } = chai;

describe('Teste para Login', () => {
    beforeEach(() => {
      sinon.restore();
    });

it('Status 200 - login com sucesso', async () => {
  const response = await chai.request(app).post('/login').send(validLogin);
  
  expect(response.status).to.equal(200);
  expect(response.body).to.have.property('token');
});
it('Status 400 - empty request body', async () => {
  const response = await chai.request(app).post('/login').send({});

  expect(response.status).to.equal(400);
  expect(response.body).to.deep.equal({ message: 'All fields must be filled' });
});
it('Status 401 - invalid email format', async () => {
    const response = await chai.request(app).post('/login').send({ email: 'invalid_email', password: 'secret_user' });
  
    expect(response.status).to.equal(401);
    expect(response.body).to.deep.equal({ message: 'Invalid email or password' });
  });
it('Status 401 - User não encontrado', async () => {
    const nonExistentUser = { email: 'non-existent@example.com', password: 'secret_user' };
    const response = await chai.request(app).post('/login').send(nonExistentUser);

    expect(response.status).to.equal(401);
    expect(response.body).to.deep.equal({ message: 'Invalid email or password' });
  });
it('Status 401 - invalid password format', async () => {
    const invalidPassword = { email: 'user@example.com', password: 'short' };
    const response = await chai.request(app).post('/login').send(invalidPassword);

    expect(response.status).to.equal(401);
    expect(response.body).to.deep.equal({ message: 'Invalid email or password' });
  });

});
describe('Teste para Token', () => {
  it('Status 401 - token não enviado', async () => {
      const response = await chai.request(app).get('/login/role');

      expect(response.status).to.equal(401);
      expect(response.body).to.deep.equal({ message: 'Token not found' });
    });

    it('Status 401 - token invalido', async () => {
      sinon.stub(jwtUtil, 'verify').throws(new Error('Invalid token'));

      const response = await chai.request(app).get('/login/role').set('Authorization', 'tokenInvalido');

      expect(response.status).to.equal(401);
      expect(response.body).to.deep.equal({ message: 'Token must be a valid token' });
    });
});