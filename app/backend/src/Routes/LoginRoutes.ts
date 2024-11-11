import { Router } from 'express';
import LoginController from '../Controllers/LoginController';
import validateToken from '../middlewares/ValidateLogin';

const loginRouter = Router();

loginRouter.post('/', (req, res) => LoginController.login(req, res));
loginRouter.get('/role', validateToken, LoginController.getRole);

export default loginRouter;
