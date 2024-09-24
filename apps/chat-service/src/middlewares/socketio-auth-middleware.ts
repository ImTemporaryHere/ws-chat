import { Server } from 'socket.io';
import { AuthService, TokenPayload } from '@ws-chat/auth';

type IoMiddleware = Parameters<Server['use']>[0];

declare module 'socket.io' {
  interface Socket {
    user: TokenPayload;
  }
}

export const getAuthSocketMiddleware: (
  authService: AuthService
) => IoMiddleware = (authService) => (socket, next) => {
  const accessToken = socket.handshake.headers.authorization as string;
  if (!accessToken) {
    return next(new Error('not authorized'));
  }

  const userData = authService.verifyAccessToken(accessToken);

  if (!userData) {
    return next(new Error('not authorized'));
  }
  socket['user'] = userData as TokenPayload;
  next();
};
