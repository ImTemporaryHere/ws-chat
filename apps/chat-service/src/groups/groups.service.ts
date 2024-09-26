import { GroupsRepository } from './groups.repository';
import { ICreateGroup } from './interfaces/create-group.interface';
import { Transport } from '../transports/transport';
import { TransportTopics } from '../transports/transport-topics';
import { SendGroupMessageDto } from './dto/send-group-message.dto';
import { GroupMessageInterface } from './interfaces/group-message.interface';

export class GroupsService {
  constructor(
    private readonly groupsRepository: GroupsRepository,
    private readonly transport: Transport
  ) {}

  async createGroup(params: ICreateGroup) {
    params.participantsId.push(params.ownerId);

    const createdGroup = await this.groupsRepository.create(params);

    this.transport.createGroup({
      groupId: createdGroup._id.toString(),
      participantsId: params.participantsId,
    });

    this.transport.notifyUser({
      topic: TransportTopics.groupCreated,
      userId: params.ownerId,
      message: createdGroup._id,
    });

    params.participantsId.forEach((participantId: string) => {
      this.transport.notifyUser({
        topic: TransportTopics.userAddedToGroup,
        userId: participantId,
        message: createdGroup._id.toString(),
      });
    });
  }

  async removeGroup(currentUserId: string, groupId: string) {
    //todo : can add validation whether user owns group or not
    this.transport.removeGroup(groupId);
    await this.groupsRepository.remove(groupId);
    this.transport.notifyUser({
      topic: TransportTopics.groupRemoved,
      userId: currentUserId,
      message: groupId,
    });
  }

  async leaveGroup(userId: string, groupId: string) {
    this.transport.leaveGroup(userId, groupId);
    this.sendMessageToGroup({
      groupId,
      message: `user ${userId} left the group`,
      senderId: 'system',
    });
    await this.groupsRepository.leaveGroup(userId, groupId);
  }

  async joinGroup(userId: string, groupId: string) {
    this.transport.joinGroup({ userId, groupId });
    await this.groupsRepository.joinGroup(userId, groupId);
  }

  sendMessageToGroup(data: GroupMessageInterface) {
    // console.log("sendMessageToGroup", data);
    this.transport.sendMessageToGroup(data);
    //use repository for updating group history
  }
}
