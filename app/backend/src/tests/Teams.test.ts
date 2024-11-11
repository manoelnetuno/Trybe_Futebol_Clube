import * as sinon from 'sinon';
import * as chai from 'chai';

// @ts-ignore
import chaiHttp = require('chai-http');
import { App } from '../app';
import sequelizeteam from '../database/models/TeamModel';
import { teams, team } from './mocks/TeamMocks';

chai.use(chaiHttp);

const { app } = new App();

const { expect } = chai;

describe('Times testes', function() {
  beforeEach(function () {
    sinon.restore();
  });
  it('should return all teams', async function() {
    sinon.stub(sequelizeteam, 'findAll').resolves(teams as any);

    const { status, body } = await chai.request(app).get('/teams');

    expect(status).to.equal(200);
    expect(body).to.deep.equal(teams);
  });

  it('should return a team by id', async function() {
    sinon.stub(sequelizeteam, 'findOne').resolves(team as any);

    const { status, body } = await chai.request(app).get('/teams/1');

    expect(status).to.equal(200);
    expect(body).to.deep.equal(team);
  });

  it('should return not found if the team doesn\'t exists', async function() {
    sinon.stub(sequelizeteam, 'findOne').resolves(null);

    const { status, body } = await chai.request(app).get('/teams/1');

    expect(status).to.equal(404);
    expect(body.message).to.equal('Time1 não encontrado');
  });
});