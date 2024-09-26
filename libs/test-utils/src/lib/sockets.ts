import { io, Socket } from 'socket.io-client';
import { TransportTopics } from '../../../../apps/chat-service/src/transports/transport-topics';
import { CreateGroupDto } from '../../../../apps/chat-service/src/groups/dto/create-group.dto';

export async function testConnectToSocket({
  baseUrl,
  access_token,
}: {
  baseUrl: string;
  access_token: string;
}): Promise<Socket> {
  const socket = io(baseUrl, {
    reconnectionDelayMax: 10000,
    extraHeaders: {
      Authorization: access_token,
    },
  });

  return new Promise((res, rej) => {
    socket.on('connect', () => {
      const interval = setInterval(() => {
        if (socket.connected) {
          clearInterval(interval);
          return res(socket);
        }
      }, 10);
    });
  });
}

export function userSocketCreateGroup(
  socket: Socket,
  participantsId: string[],
  timeout: number
): Promise<string> {
  return new Promise((res, rej) => {
    const timer = setTimeout(() => {
      rej('group was not created in time');
    }, timeout);
    socket.once(TransportTopics.groupCreated, (createdGroupId) => {
      clearTimeout(timer);
      res(createdGroupId);
    });

    const createGroupData: CreateGroupDto = {
      name: 'just a new group',
      participantsId,
    };
    socket.emit(TransportTopics.createGroup, createGroupData);
  });
}
