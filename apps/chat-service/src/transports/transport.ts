import { GroupMessageInterface } from "../groups/interfaces/group-message.interface";
import { TransportTopics } from "./transport-topics";
import { UserJoinGroupPayload } from "../groups/interfaces/user-join-group-payload.interface";

export interface Transport {
  notifyUser(params: {
    topic: TransportTopics;
    userId: string;
    message?: any;
  }): void;
  createGroup(params: CreateGroupTransportParams): void;
  removeGroup(groupId: string): void;
  leaveGroup(userId: string, groupId: string): void;
  joinGroup(data: UserJoinGroupPayload): void;
  sendMessageToGroup(data: GroupMessageInterface): void;
}

export interface CreateGroupTransportParams {
  groupId: string;
  participantsId: string[];
}
