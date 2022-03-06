import { Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';

export const loggerMiddleware = (logger: Logger) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const statusCode = res.statusCode;
    const logFormat = {
      Query: JSON.stringify(req.query),
      Body: JSON.stringify(req.body),
      Parmas: JSON.stringify(req.params),
    };
    next();
    if (statusCode >= 500) {
      logger.error(`${req.method} ${req.originalUrl}`, logFormat);
    } else if (statusCode >= 400) {
      logger.warn(`${req.method} ${req.originalUrl}`, logFormat);
    } else {
      logger.http(`${req.method} ${req.originalUrl}`, logFormat);
    }
  };
};
