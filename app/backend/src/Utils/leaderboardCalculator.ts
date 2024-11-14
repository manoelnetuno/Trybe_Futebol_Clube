import { MatchWithTeams } from '../Interfaces/MatchingTeams'; // Ajuste o caminho conforme necessário
import { Leaderboard } from '../Interfaces/Leaderboard'; // Ajuste o caminho conforme necessário

export default class LeaderboardCalculator {
  public static calculateTeamStats(
    matches: MatchWithTeams[],
    isHomeTeam: boolean,
  ): { [key: string]: Leaderboard } {
    const teamStats: { [key: string]: Leaderboard } = {};
    matches.forEach((match) => {
      const teamName = isHomeTeam ? match.homeTeam.teamName : match.awayTeam.teamName;

      if (!teamStats[teamName]) {
        teamStats[teamName] = this.initializeTeamStats(teamName);
      }

      teamStats[teamName] = this.updateTeamStats(teamStats[teamName], match, isHomeTeam);
    });

    // Calcular o saldo de gols e eficiência após todas as partidas
    Object.keys(teamStats).forEach((teamName) => {
      const stats = teamStats[teamName];
      stats.goalsBalance = stats.goalsFavor - stats.goalsOwn;
      stats.efficiency = (((stats.totalPoints / (stats.totalGames * 3)) * 100).toFixed(2)
      );
    });

    return teamStats;
  }

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

  private static updateTeamStats(
    team: Leaderboard,
    match: MatchWithTeams,
    isHomeTeam: boolean,
  ): Leaderboard {
    const { points, goalsFavor, goalsOwn } = this.calculateGoalsAndPoints(match, isHomeTeam);

    return {
      ...team,
      totalGames: team.totalGames + 1,
      goalsFavor: team.goalsFavor + goalsFavor,
      goalsOwn: team.goalsOwn + goalsOwn,
      totalVictories: team.totalVictories + (points === 3 ? 1 : 0),
      totalPoints: team.totalPoints + points,
      totalDraws: team.totalDraws + (points === 1 ? 1 : 0),
      totalLosses: team.totalLosses + (points === 0 ? 1 : 0),
    };
  }

  private static calculateGoalsAndPoints(
    match: MatchWithTeams,
    isHomeTeam: boolean,
  ): { points: number; goalsFavor: number; goalsOwn: number } {
    const homeGoals = match.homeTeamGoals;
    const awayGoals = match.awayTeamGoals;

    const goalsFavor = isHomeTeam ? homeGoals : awayGoals;
    const goalsOwn = isHomeTeam ? awayGoals : homeGoals;

    let points = 0;

    if (homeGoals > awayGoals) {
      points = isHomeTeam ? 3 : 0; // Time da casa vence
    } else if (homeGoals < awayGoals) {
      points = isHomeTeam ? 0 : 3; // Time visitante vence
    } else {
      points = 1; // Empate
    }

    return { points, goalsFavor, goalsOwn };
  }
}
