import { Request, Response } from 'express';
import MatchService from '../Services/MatchesServices';
import { MatchFilter } from '../Interfaces/IMacthes';

export default class MatchController {
  public static async getAllMatches(req: Request, res: Response): Promise<Response> {
    const filters: MatchFilter = {};
    if (req.query.inProgress) filters.inProgress = req.query.inProgress as string | undefined;

    try {
      const matches = await MatchService.getAllMatches(filters);
      return res.status(200).json(matches);
    } catch (error) {
      return res.status(500).json({ message: 'Não é possivel encontrar partidas :(' });
    }
  }

  public static async finishMatch(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      await MatchService.finishMatch(Number(id));
      return res.status(200).json({ message: 'Partida finalizada com sucesso :)' });
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao finalizar a partida 8(' });
    }
  }

  public static async updateMatch(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { homeTeamGoals, awayTeamGoals } = req.body;

      await MatchService.updateMatch(Number(id), homeTeamGoals, awayTeamGoals);
      return res.status(200).json({ message: 'Partida Atualizada com sucesso ;)' });
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao atualizar a partida 8(' });
    }
  }

  public static async createMatch(req: Request, res: Response): Promise<Response> {
    try {
      const { homeTeamId, awayTeamId, homeTeamGoals, awayTeamGoals } = req.body;
      const newMatch = await MatchService.createMatch(
        homeTeamId,
        awayTeamId,
        homeTeamGoals,
        awayTeamGoals,
      );

      return res.status(201).json(newMatch);
    } catch (error) {
      return MatchController.handleError(error, res);
    }
  }

  private static handleError(error: unknown, res: Response): Response {
    console.error('Erro ao criar nova partida:', error);

    if (error instanceof Error) {
      if (error.message === 'It is not possible to create a match with two equal teams') {
        return res.status(422).json({ message: error.message });
      }
      if (error.message === 'There is no team with such id!') {
        return res.status(404).json({ message: error.message });
      }
    }

    return res.status(500).json({ message: 'Erro interno ao criar partida' });
  }

  public static async getHomeLeaderboard(_req: Request, res: Response): Promise<Response> {
    try {
      const leaderboard = await MatchService.getHomeLeaderboard();
      return res.status(200).json(leaderboard);
    } catch (error) {
      console.error('Erro ao buscar a leaderboard dos times da casa:', error);
      return res.status(500).json({ message: 'Erro interno ao buscar leaderboard' });
    }
  }
}
