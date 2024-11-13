import { Imatchs } from './leaderboardmatches';

export interface Leaderboard {
  name: string,
  totalPoints: number,
  totalGames: number,
  totalVictories: number,
  totalDraws: number,
  totalLosses: number,
  goalsFavor: number,
  goalsOwn: number,
}

export interface ILeaderboard {
  getFinishedMatches(): Promise<Imatchs[]>,
  getHomeTeamStats(): Promise<Leaderboard[]>,
}
