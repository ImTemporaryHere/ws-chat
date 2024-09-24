import { Socket } from "socket.io";

type UserSocketsMap = Map<string, Map<string, Socket>>;

export class UserSocketsMapper {
  private userSocketMap: UserSocketsMap = new Map();
  private activeSessions = 0;

  addSocket(userId: string, socket: Socket) {
    this.registerSocketEventHandlers(userId, socket);

    const existingUserSockets = this.userSocketMap.get(userId);
    if (existingUserSockets) {
      existingUserSockets.set(socket.id, socket);
    } else {
      const newSocketsMap = new Map();
      newSocketsMap.set(socket.id, socket);
      this.userSocketMap.set(userId, newSocketsMap);
    }

    this.activeSessions += 1;

    console.log(
      new Date(),
      `socket id ${socket.id} connected, active sockets ${this.activeSessions}`,
    );
  }

  getSockets(userId: string) {
    return this.userSocketMap.get(userId);
  }

  private registerSocketEventHandlers(userId: string, socket: Socket) {
    socket.on("disconnect", () => {
      const sockets = this.userSocketMap.get(userId)!;

      sockets.delete(socket.id);

      this.activeSessions -= 1;

      console.log(
        new Date(),
        `socket id ${socket.id} disconnected,active sockets ${this.activeSessions}`,
      );
    });
  }
}
