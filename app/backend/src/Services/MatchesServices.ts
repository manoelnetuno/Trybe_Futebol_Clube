import Match from '../database/models/MatchModel';
import Team from '../database/models/TeamModel';
import { Leaderboard } from '../Interfaces/Leaderboard';
import { MatchWithTeams } from '../Interfaces/MatchingTeams';
import { MatchFilter } from '../Interfaces/IMacthes';
import LeaderboardCalculator from '../Utils/leaderboardCalculator';

export default class MatchService {
  public static async getAllMatches(filters: MatchFilter): Promise<Match[]> {
    const whereCondition = filters.inProgress !== undefined
      ? { inProgress: filters.inProgress === 'true' }
      : {};
    const includeOptions = [
      { model: Team, as: 'homeTeam', attributes: ['teamName'] },
      { model: Team, as: 'awayTeam', attributes: ['teamName'] },
    ];

    try {
      const matches = await Match.findAll({ where: whereCondition, include: includeOptions });
      return matches;
    } catch (error) {
      console.error('Não é possivel encontrar partidas :(', error);
      throw error;
    }
  }

  public static async finishMatch(id: number): Promise<void> {
    const match = await Match.findByPk(id);

    if (!match) {
      throw new Error(`Partida com ${id} não encontrada :(`);
    }

    await match.update({ inProgress: false });
  }

  public static async updateMatch(
    id: number,
    homeTeamGoals: number,
    awayTeamGoals: number,
  ): Promise<void> {
    const match = await Match.findByPk(id);

    if (!match) {
      throw new Error('Partida não encontrada :(');
    }

    await match.update({
      homeTeamGoals,
      awayTeamGoals,
    });
  }

  private static async validateMatchCreation(
    homeTeamId: number,
    awayTeamId: number,
  ): Promise<void> {
    if (homeTeamId === awayTeamId) {
      throw new Error('It is not possible to create a match with two equal teams');
    }

    const [homeTeam, awayTeam] = await Promise.all([
      Team.findByPk(homeTeamId),
      Team.findByPk(awayTeamId),
    ]);

    if (!homeTeam || !awayTeam) {
      throw new Error('There is no team with such id!');
    }
  }

  public static async createMatch(
    homeTeamId: number,
    awayTeamId: number,
    homeTeamGoals: number,
    awayTeamGoals: number,
  ): Promise<Match> {
    await MatchService.validateMatchCreation(homeTeamId, awayTeamId);

    const newMatch = await Match.create({
      homeTeamId,
      awayTeamId,
      homeTeamGoals,
      awayTeamGoals,
      inProgress: true,
    });

    return newMatch;
  }

  // private static _createLeaderboardEntries(teamStats: { [key: string]
  // : Leaderboard }): Leaderboard[] {
  //   return Object.keys(teamStats).map((teamName) => ({
  //     name: teamName,
  //     totalPoints: teamStats[teamName].totalPoints,
  //     totalGames: teamStats[teamName].totalGames,
  //     totalVictories: teamStats[teamName].totalVictories,
  //     totalDraws: teamStats[teamName].totalDraws,
  //     totalLosses: teamStats[teamName].totalLosses,
  //     goalsFavor: teamStats[teamName].goalsFavor,
  //     goalsOwn: teamStats[teamName].goalsOwn,
  //     goalsBalance: teamStats[teamName].goalsBalance,
  //     efficiency: teamStats[teamName].efficiency,
  //   }));
  // }
  public static async getHomeLeaderboard(): Promise<Leaderboard[]> {
    const matches = await this.getFinishedMatches('home'); // Passa 'home' para buscar partidas da casa
    const teamStats = LeaderboardCalculator.calculateTeamStats(matches, true); // true para times da casa

    const leaderboardEntries = this._createLeaderboardEntries(teamStats);
    this._sortLeaderboard(leaderboardEntries);

    return leaderboardEntries;
  }

  // Método para obter a tabela de classificação dos times visitantes
  public static async getAwayLeaderboard(): Promise<Leaderboard[]> {
    const matches = await this.getFinishedMatches('away'); // Passa 'away' para buscar partidas visitantes
    const teamStats = LeaderboardCalculator.calculateTeamStats(matches, false); // false para times visitantes

    const leaderboardEntries = this._createLeaderboardEntries(teamStats);
    this._sortLeaderboard(leaderboardEntries);

    return leaderboardEntries;
  }

  // Método para buscar todas as partidas terminadas, seja da casa ou visitantes
  private static async getFinishedMatches(type: 'home' | 'away'): Promise<MatchWithTeams[]> {
    const matches = await Match.findAll({
      where: { inProgress: false },
      include: [{
        model: Team, as: type === 'home' ? 'homeTeam' : 'awayTeam', attributes: ['teamName'] }],
    });

    return matches.map((match: Match) => ({
      id: match.id,
      homeTeamGoals: match.homeTeamGoals,
      awayTeamGoals: match.awayTeamGoals,
      inProgress: match.inProgress,
      homeTeam: {
        teamName: match.homeTeam?.teamName || '',
      },
      awayTeam: {
        teamName: match.awayTeam?.teamName || '',
      },
    }));
  }

  // Método para criar as entradas da tabela de classificação
  private static _createLeaderboardEntries(teamStats: {
    [key: string]: Leaderboard }): Leaderboard[] {
    return Object.values(teamStats);
  }

  // Método para ordenar a tabela de classificação
  private static _sortLeaderboard(leaderboardEntries: Leaderboard[]): void {
    leaderboardEntries.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.goalsBalance !== a.goalsBalance) return b.goalsBalance - a.goalsBalance;
      if (b.goalsFavor !== a.goalsFavor) return b.goalsFavor - a.goalsFavor;
      if (b.goalsOwn !== a.goalsOwn) return b.goalsOwn - a.goalsOwn;
      return b.totalVictories - a.totalVictories;
    });
  }
}
