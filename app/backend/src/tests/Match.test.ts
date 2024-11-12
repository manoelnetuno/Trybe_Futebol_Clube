import * as sinon from 'sinon';
import * as chai from 'chai';
// @ts-ignore
import chaiHttp = require('chai-http');
import { App } from '../app';
import SequelizeMatch from '../database/models/MatchModel';

import { allMatches, finishedMatches, inProgressMatches } from './mocks/MatchMock';

chai.use(chaiHttp);

const { app } = new App();
const { expect } = chai;

describe('Teste de integração para o endpoint /match', () => {
  beforeEach(function () {
    sinon.restore();
  });

  it('Status 200 - Retorna todas as partidas', async () => {
    sinon.stub(SequelizeMatch, 'findAll').resolves(allMatches as any);

    const response = await chai.request(app).get('/matches')

    expect(response).to.have.status(200);
    expect(response.body).to.be.an('array');
    expect(response.body).to.deep.equal(allMatches);
  });

  it('Status 200 - Retorna todas as partidas em andamento', async () => {
    sinon.stub(SequelizeMatch, 'findAll').resolves(inProgressMatches as any);

const Response = await chai.request(app).get('/matches?inProgress=true');

    expect(Response).to.have.status(200);
    expect(Response.body).to.be.an('array');
    expect(Response.body).to.deep.equal(inProgressMatches);
    const allInProgressTrue = Response.body.every((match: any) => match.inProgress === true);
    expect(allInProgressTrue).to.be.true;
  });

  it('Status 200 - Retorna todas as partidas finalizadas', async () => {
    sinon.stub(SequelizeMatch, 'findAll').resolves(finishedMatches as any);

   const Response = await chai.request(app).get(`/matches?inProgress=false`);

    expect(Response).to.have.status(200);
    expect(Response.body).to.deep.equal(finishedMatches);
    expect(Response.body).to.be.an('array');
    const allInProgressFalse = Response.body.every((match: any) => match.inProgress === false);
    expect(allInProgressFalse).to.be.true;
  });
});