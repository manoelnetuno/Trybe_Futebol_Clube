import { Leaderboard, ILeaderboard } from '../Interfaces/Leaderboard';
import SequelizeMatch from '../database/models/MatchModel';
import SequelizeTeam from '../database/models/TeamModel';
import { Imatchs } from '../Interfaces/leaderboardmatches';

const initialTeamStats: Leaderboard = {
  name: '',
  totalPoints: 0,
  totalGames: 0,
  totalVictories: 0,
  totalDraws: 0,
  totalLosses: 0,
  goalsFavor: 0,
  goalsOwn: 0,
};

class LeaderboardModel implements ILeaderboard {
  private matchModel = SequelizeMatch;

  async getFinishedMatches(): Promise<Imatchs[]> {
    const matches = await this.matchModel.findAll({
      where: { inProgress: false },
      include: [
        { model: SequelizeTeam, as: 'homeTeam', attributes: ['teamName'] },
        { model: SequelizeTeam, as: 'awayTeam', attributes: ['teamName'] },
      ],
    }) as unknown as Imatchs[];
    return matches;
  }

  async getHomeTeamStats(): Promise<Leaderboard[]> {
    const matches = await this.getFinishedMatches();
    const acc: { [key: string]: Leaderboard } = {};

    matches.forEach((match) => {
      const homeTeam = match.homeTeam.teamName;
      const { homeTeamGoals, awayTeamGoals } = match;
      this.updateTeamStats(acc, homeTeam, homeTeamGoals, awayTeamGoals);
    });

    return Object.values(acc);
  }

  async getAwayTeamStats(): Promise<Leaderboard[]> {
    const matches = await this.getFinishedMatches();
    const acc: { [key: string]: Leaderboard } = {};

    matches.forEach((match) => {
      const awayTeam = match.awayTeam.teamName;
      const { homeTeamGoals, awayTeamGoals } = match;
      this.updateTeamStats(acc, awayTeam, awayTeamGoals, homeTeamGoals);
    });

    return Object.values(acc);
  }

  private static updateTeamStats(
    acc: { [key: string]: Leaderboard } & ThisType<{ [key: string]: Leaderboard }>,
    teamName: string,
    teamGoals: number,
    opponentGoals: number,
  ) {
    try {
      acc[teamName] = acc[teamName] || { ...initialTeamStats, name: teamName };

      acc[teamName].totalGames += 1;
      acc[teamName].goalsFavor += teamGoals;
      acc[teamName].goalsOwn += opponentGoals;
    } catch (error) {
      console.error(`Error updating team stats: ${error}`);
    }
  }
}

export default LeaderboardModel;
