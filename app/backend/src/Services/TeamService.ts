import { ITeamModel } from '../Interfaces/TeamModel';
import { ServiceResponse } from '../Interfaces/ServiceResponse';
import { ITeams } from '../Interfaces/ITeams';
import TeamModel from '../Models/TeamModel';

export default class TeamService {
  constructor(
    private teamModel: ITeamModel = new TeamModel(),
  ) {}

  public async getAllTeams(): Promise<ServiceResponse<ITeams[]>> {
    const allTeams = await this.teamModel.findAll();
    return { status: 'SUCCESSFUL', data: allTeams };
  }

  public async getTeamById(id: number): Promise<ServiceResponse<ITeams>> {
    const teams = await this.teamModel.findById(id);
    if (!teams) return { status: 'NOT_FOUND', data: { message: `Time${id} não encontrado` } };
    return { status: 'SUCCESSFUL', data: teams };
  }
}
