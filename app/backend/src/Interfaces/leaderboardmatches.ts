import Match from './IMacthes';

export interface Imatchs extends Match {
  homeTeam: { teamName:string },
  awayTeam: { teamName:string },
}
