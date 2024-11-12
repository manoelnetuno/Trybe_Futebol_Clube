import Team from '../database/models/TeamModel';

export interface MatchWithTeams {
  id: number;
  homeTeamGoals: number;
  awayTeamGoals: number;
  inProgress: boolean;
  homeTeam: {
    teamName: string;
  };
  awayTeam: {
    teamName: string;
  };
}

export interface MatchWithTeamsResponse {
  id: number;
  homeTeamGoals: number;
  awayTeamGoals: number;
  inProgress: boolean;
  homeTeam: Team;
  awayTeam: Team;
}
