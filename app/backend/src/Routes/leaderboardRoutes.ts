import { Router } from 'express';
import LeaderboardController from '../Controllers/leaderboardController';

const Leaderboardrouter = Router();

Leaderboardrouter.get('/home', LeaderboardController.getHomeLeaderboard);
Leaderboardrouter.get('/away', LeaderboardController.getAwayLeaderboard);

export default Leaderboardrouter;
