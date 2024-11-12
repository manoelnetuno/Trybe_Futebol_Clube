import { Router } from 'express';
import MatchController from '../Controllers/MatchController';
import authMiddleware from '../middlewares/authmiddlaware';

const matchRouter = Router();

matchRouter.get('/', (req, res) => MatchController.getAllMatches(req, res));
matchRouter.patch('/:id/finish', authMiddleware, MatchController.finishMatch);
matchRouter.patch('/:id', authMiddleware, MatchController.updateMatch);
matchRouter.post('/', authMiddleware, MatchController.createMatch);

export default matchRouter;
