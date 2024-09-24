import { Server } from "socket.io";
import { UserSocketsMapper } from "./sokets-mapper";
import { CreateGroupTransportParams, Transport } from "./transport";
import { GroupMessageInterface } from "../groups/interfaces/group-message.interface";
import { TransportTopics } from "./transport-topics";
import { UserJoinGroupPayload } from "../groups/interfaces/user-join-group-payload.interface";

export class SocketIoTransport implements Transport {
  constructor(
    private readonly mapper: UserSocketsMapper,
    private readonly io: Server,
  ) {}

  notifyUser({
    topic,
    userId,
    message,
  }: {
    topic: TransportTopics;
    userId: string;
    message?: any;
  }) {
    const sockets = this.mapper.getSockets(userId);
    if (sockets) {
      sockets.forEach((socket) => socket.emit(topic, message));
    }
  }

  createGroup({ groupId, participantsId }: CreateGroupTransportParams) {
    participantsId.forEach((userId) => {
      const sockets = this.mapper.getSockets(userId);
      if (sockets) {
        sockets.forEach((socket) => {
          socket.join(groupId);
        });
      }
    });
  }
  removeGroup(groupId: string) {
    this.io.socketsLeave(groupId);
  }

  leaveGroup(userId: string, groupId: string) {
    this.mapper.getSockets(userId)?.forEach((s) => s.leave(groupId));
    this.io.to(groupId).emit("userLeft", `User ${userId} left this group`);
  }

  joinGroup(data: UserJoinGroupPayload) {
    this.mapper
      .getSockets(data.userId)
      ?.forEach((socket) => socket.join(data.groupId));

    this.io.to(data.groupId).emit(TransportTopics.userJoinedGroup, data);
  }

  sendMessageToGroup(data: GroupMessageInterface) {
    this.io.in(data.groupId).emit(TransportTopics.groupMessageSent, data);
  }
}
