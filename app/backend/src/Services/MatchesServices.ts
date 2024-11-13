import Match from '../database/models/MatchModel';
import Team from '../database/models/TeamModel';
import { Leaderboard } from '../Interfaces/Leaderboard';
import { MatchFilter } from '../Interfaces/IMacthes';

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

  private static _createLeaderboardEntries(teamStats: { [key: string]
  : Leaderboard }): Leaderboard[] {
    return Object.keys(teamStats).map((teamName) => ({
      name: teamName,
      totalPoints: teamStats[teamName].totalPoints,
      totalGames: teamStats[teamName].totalGames,
      totalVictories: teamStats[teamName].totalVictories,
      totalDraws: teamStats[teamName].totalDraws,
      totalLosses: teamStats[teamName].totalLosses,
      goalsFavor: teamStats[teamName].goalsFavor,
      goalsOwn: teamStats[teamName].goalsOwn,
    }));
  }
}
