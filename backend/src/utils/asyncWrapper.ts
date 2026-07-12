import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncRequestHandler = (req: any, res: any, next: NextFunction) => Promise<unknown>;

export const asyncWrapper = (fn: AsyncRequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
