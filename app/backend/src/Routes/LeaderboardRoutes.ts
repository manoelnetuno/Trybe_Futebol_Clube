import { Router } from 'express';
import LeaderboardController from '../Controllers/LeaderboardController';

const leaderboardController = new LeaderboardController();

const leaderboardRouter = Router();

leaderboardRouter.get('/home', (req, res) => leaderboardController.getHomeLeaderboard(req, res));
leaderboardRouter.get('/away', (req, res) => leaderboardController.getAwayLeaderboard(req, res));

export default leaderboardRouter;
