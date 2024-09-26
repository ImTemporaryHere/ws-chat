import { GroupsService } from './groups.service';
import { Socket } from 'socket.io';
import { CreateGroupDto } from './dto/create-group.dto';
import { SendGroupMessageDto } from './dto/send-group-message.dto';
import { TransportTopics } from '../transports/transport-topics';

export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  async createGroup(socket: Socket, { participantsId, name }: CreateGroupDto) {
    try {
      await this.groupsService.createGroup({
        ownerId: socket.user.userId,
        name,
        participantsId,
      });
    } catch (e: any) {
      console.error(e);
      socket.emit('group.create.error', e.toString());
    }
  }

  async removeGroup(socket: Socket, groupId: string) {
    try {
      await this.groupsService.removeGroup(socket.user.userId, groupId);
    } catch (e: any) {
      console.error(e);
      socket.emit('group.remove.error', e.toString());
    }
  }

  async leaveGroup(socket: Socket, groupId: string) {
    try {
      await this.groupsService.leaveGroup(socket.user.userId, groupId);
    } catch (e: any) {
      console.error(e);
      socket.emit('group.leave.error', e.toString());
    }
  }

  async joinGroup(socket: Socket, groupId: string) {
    try {
      await this.groupsService.joinGroup(socket.user.userId, groupId);
    } catch (e: any) {
      console.error(e);
      socket.emit('group.join.error', e.toString());
    }
  }

  async sendMessageToGroup(socket: Socket, data: SendGroupMessageDto) {
    try {
      this.groupsService.sendMessageToGroup({
        ...data,
        senderId: socket.user.userId,
      });
    } catch (e: any) {
      console.error(e);
      socket.emit(TransportTopics.sendGroupMessage, e.toString());
    }
  }
}
