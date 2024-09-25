import { Socket } from 'socket.io';
import { CreateGroupDto } from './dto/create-group.dto';
import { SendGroupMessageDto } from './dto/send-group-message.dto';
import { GroupsController } from './groups.controller';
import { TransportTopics } from '../transports/transport-topics';

export function registerGroupHandlers(
  socket: Socket,
  groupsController: GroupsController
) {
  socket.on(TransportTopics.createGroup, async (data: CreateGroupDto) => {
    console.log(new Date(), TransportTopics.createGroup, data);
    await groupsController.createGroup(socket, data);
  });

  socket.on(TransportTopics.removeGroup, async (groupId: string) => {
    await groupsController.removeGroup(socket, groupId);
  });

  socket.on(TransportTopics.leaveGroup, async (groupId: string) => {
    await groupsController.leaveGroup(socket, groupId);
  });

  socket.on(TransportTopics.joinGroup, async (groupId: string) => {
    await groupsController.joinGroup(socket, groupId);
  });

  socket.on(
    TransportTopics.sendGroupMessage,
    async (data: SendGroupMessageDto) => {
      await groupsController.sendMessageToGroup(socket, data);
    }
  );
}
