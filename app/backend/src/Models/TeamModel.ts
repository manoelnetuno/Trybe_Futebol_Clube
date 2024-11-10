import sequelizeModel from '../database/models/TeamModel';
import { ITeams } from '../Interfaces/ITeams';
import { ITeamModel } from '../Interfaces/TeamModel';
import { NewEntity } from '../Interfaces';

export default class TeamModel implements ITeamModel {
  private model = sequelizeModel;

  async create(data: NewEntity<ITeams>): Promise<ITeams> {
    const dbData = await this.model.create(data);

    const { id, teamName }: ITeams = dbData;
    return { id, teamName };
  }

  async findAll(): Promise<ITeams[]> {
    const teams = await this.model.findAll();
    return teams;
  }

  async findById(id: number): Promise<ITeams | null> {
    const team = await this.model.findByPk(id);
    if (!team) return null;
    return team;
  }
}
