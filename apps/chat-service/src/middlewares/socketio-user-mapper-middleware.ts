import { Server } from "socket.io";
import { UserSocketsMapper } from "../transports/sokets-mapper";
type IoMiddleware = Parameters<Server["use"]>[0];

export const getSocketIoUserMapperMiddleware: (
  socketsMapper: UserSocketsMapper,
) => IoMiddleware = (socketsMapper) => (socket, next) => {
  socketsMapper.addSocket(socket.user.userId, socket);

  next();
};
