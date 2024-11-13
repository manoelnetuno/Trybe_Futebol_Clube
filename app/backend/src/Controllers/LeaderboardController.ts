import { Request, Response } from 'express';
import LeaderboardService from '../Services/LeaderboardService';

export default class LeaderboardController {
  constructor(private leaderboardService = new LeaderboardService()) {}

  async getHomeLeaderboard(req: Request, res: Response): Promise<Response> {
    const Homeboard = await this.leaderboardService.getHomeTeamStats();
    return res.status(200).json(Homeboard);
  }

  async getAwayLeaderboard(req: Request, res: Response): Promise<Response> {
    const Awayboard = await this.leaderboardService.getAwayTeamStats();
    return res.status(200).json(Awayboard);
  }
}
