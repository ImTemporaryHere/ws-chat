import { NextFunction, Request, Response } from 'express';
import { ApiException } from '../exeptions/api-exception';
import { AuthService, TokenPayload } from '@ws-chat/auth';

declare module 'express-serve-static-core' {
  interface Request {
    user?: TokenPayload;
  }
}

export const getAuthMiddleware =
  (authService: AuthService) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = req.headers.authorization?.split(' ')[1];

      if (!accessToken) {
        return next(ApiException.unauthorizedError());
      }

      const userData = authService.verifyAccessToken(accessToken);

      if (!userData) {
        return next(ApiException.unauthorizedError());
      }
      req['user'] = userData as TokenPayload;
      next();
    } catch (e) {
      return next(ApiException.unauthorizedError());
    }
  };
