import LeaderboardModel from '../Models/LeaderboardModel';
import { Leaderboard } from '../Interfaces/Leaderboard';

class LeaderboardService {
  private leaderboardModel = new LeaderboardModel();

  async getHomeTeamStats(): Promise<Leaderboard[]> {
    return this.leaderboardModel.getHomeTeamStats();
  }

  async getAwayTeamStats(): Promise<Leaderboard[]> {
    return this.leaderboardModel.getAwayTeamStats();
  }
}

export default LeaderboardService;
