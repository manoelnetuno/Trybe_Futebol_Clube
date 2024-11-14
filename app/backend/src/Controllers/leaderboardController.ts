import { Request, Response } from 'express';
import MatchService from '../Services/MatchesServices';

class LeaderboardController {
  public static async getHomeLeaderboard(req: Request, res: Response): Promise<Response> {
    try {
      const leaderboard = await MatchService.getHomeLeaderboard();
      return res.status(200).json(leaderboard);
    } catch (error) {
      console.error('Error fetching home leaderboard:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public static async getAwayLeaderboard(req: Request, res: Response): Promise<Response> {
    try {
      const leaderboard = await MatchService.getAwayLeaderboard();
      return res.status(200).json(leaderboard);
    } catch (error) {
      console.error('Error fetching away leaderboard:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default LeaderboardController;
