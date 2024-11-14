import Match from '../database/models/MatchModel';
import Team from '../database/models/TeamModel';
import { Leaderboard } from '../Interfaces/Leaderboard';
import { MatchWithTeams } from '../Interfaces/MatchingTeams';
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
      goalsBalance: teamStats[teamName].goalsBalance,
      efficiency: teamStats[teamName].efficiency,
    }));
  }

  public static async getHomeLeaderboard()
  : Promise<Leaderboard[]> {
    const matches = await this.getFinishedHomeMatches();
    const teamStats = this.calculateHomeTeamStats(matches);

    const leaderboardEntries = MatchService._createLeaderboardEntries(teamStats);

    leaderboardEntries.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.goalsBalance !== a.goalsBalance) return b.goalsBalance - a.goalsBalance;
      if (b.goalsFavor !== a.goalsFavor) return b.goalsFavor - a.goalsFavor;
      if (b.goalsOwn !== a.goalsOwn) return b.goalsOwn - a.goalsOwn;
      return b.totalVictories - a.totalVictories;
    });

    return leaderboardEntries;
  }

  // Busca todas as partidas terminadas de times da casa.
  private static async getFinishedHomeMatches(): Promise<MatchWithTeams[]> {
    const matches = await Match.findAll({
      where: { inProgress: false },
      include: [{ model: Team, as: 'homeTeam', attributes: ['teamName'] }],
    });

    const finishedHomeMatches = matches.map((match: Match) => ({
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
    return finishedHomeMatches;
  }

  // Calcula as estatísticas dos times com base nas partidas jogadas em casa.
  private static calculateHomeTeamStats(matches
  : MatchWithTeams[]): { [key: string]: Leaderboard } {
    const teamStats: { [key: string]: Leaderboard } = {};
    matches.forEach((match) => {
      const { teamName: homeTeamName } = match.homeTeam;
      if (!teamStats[homeTeamName]) {
        teamStats[homeTeamName] = this.initializeTeamStats(homeTeamName);
      }

      teamStats[homeTeamName] = this.updateTeamStats(teamStats[homeTeamName], match, true);
    });
    Object.keys(teamStats).forEach((teamName) => {
      const stats = teamStats[teamName];
      stats.goalsBalance = stats.goalsFavor - stats.goalsOwn;
      stats.efficiency = ((stats.totalPoints / (stats.totalGames * 3)) * 100).toFixed(2);
    });
    return teamStats;
  }

  // Inicializa as estatísticas de um time.
  private static initializeTeamStats(teamName: string): Leaderboard {
    return {
      name: teamName,
      totalPoints: 0,
      totalGames: 0,
      totalVictories: 0,
      totalDraws: 0,
      totalLosses: 0,
      goalsFavor: 0,
      goalsOwn: 0,
      goalsBalance: 0,
      efficiency: '0',
    };
  }

  // Atualiza as estatísticas de um time com os dados de uma partida.
  private static updateTeamStats(team
  : Leaderboard, match: MatchWithTeams, isHomeTeam: boolean): Leaderboard {
    const { points, goalsFavor, goalsOwn } = this.calculateGoalsAndPoints(match, isHomeTeam);

    // Atualiza as estatísticas do time com os novos dados calculados
    const updatedTeamStats = {
      ...team,
      totalGames: team.totalGames + 1,
      goalsFavor: team.goalsFavor + goalsFavor,
      goalsOwn: team.goalsOwn + goalsOwn,
      totalVictories: team.totalVictories + (points === 3 ? 1 : 0),
      totalPoints: team.totalPoints + points,
      totalDraws: team.totalDraws + (points === 1 ? 1 : 0),
      totalLosses: team.totalLosses + (points === 0 ? 1 : 0),
    };
    return updatedTeamStats;
  }

  // Função auxiliar para calcular os pontos e gols
  private static calculateGoalsAndPoints(match
  : MatchWithTeams, isHomeTeam: boolean)
    : { points: number, goalsFavor: number, goalsOwn: number } {
    const goalsFavor = this.calculateGoalsFavor(match, isHomeTeam);
    const goalsOwn = this.calculateGoalsOwn(match, isHomeTeam);
    const points = this.calculatePoints(match, isHomeTeam);

    return { points, goalsFavor, goalsOwn };
  }

  // Função auxiliar para calcular os gols a favor
  private static calculateGoalsFavor(match: MatchWithTeams, isHomeTeam: boolean): number {
    return isHomeTeam ? match.homeTeamGoals : match.awayTeamGoals;
  }

  // Função auxiliar para calcular os gols contra
  private static calculateGoalsOwn(match: MatchWithTeams, isHomeTeam: boolean): number {
    return isHomeTeam ? match.awayTeamGoals : match.homeTeamGoals;
  }

  // Função auxiliar para calcular os pontos
  private static calculatePoints(match: MatchWithTeams, isHomeTeam: boolean): number {
    if (isHomeTeam) {
      if (match.homeTeamGoals > match.awayTeamGoals) {
        return 3;
      } if (match.homeTeamGoals === match.awayTeamGoals) {
        return 1;
      }
    } else {
      if (match.awayTeamGoals > match.homeTeamGoals) {
        return 3;
      } if (match.awayTeamGoals === match.homeTeamGoals) {
        return 1;
      }
    }
    return 0;
  }
}
