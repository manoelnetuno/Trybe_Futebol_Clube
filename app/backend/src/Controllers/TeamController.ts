import { Request, Response } from 'express';
import TeamService from '../Services/TeamService';
import mapStatusHTTP from '../Utils/MapStatus';

export default class TeamController {
  constructor(
    private teamService = new TeamService(),
  ) { }

  public async findAllTeam(_req: Request, res: Response) {
    const serviceResponse = await this.teamService.getAllTeams();
    res.status(200).json(serviceResponse.data);
  }

  public async findTeamById(req: Request, res: Response) {
    const { id } = req.params;

    const serviceResponse = await this.teamService.getTeamById(Number(id));

    if (serviceResponse.status !== 'SUCCESSFUL') {
      return res.status(mapStatusHTTP(serviceResponse.status)).json(serviceResponse.data);
    }

    res.status(200).json(serviceResponse.data);
  }
}
