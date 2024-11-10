import { Request, Router, Response } from 'express';
import TeamController from '../Controllers/TeamController';

const teamController = new TeamController();

const teamRouter = Router();

teamRouter.get('/', (req: Request, res: Response) => teamController.findAllTeam(req, res));
teamRouter.get('/:id', (req: Request, res: Response) => teamController.findTeamById(req, res));

export default teamRouter;
