import {
  getPromiseWithResolveCb,
  getRandomUserData,
  testConnectToSocket,
  testCreateUser,
  userSocketCreateGroup,
} from '@ws-chat/test-utils';
import { Socket } from 'socket.io-client';
import { TransportTopics } from '../../../../chat-service/src/transports/transport-topics';
import { GroupMessageInterface } from '../../../../chat-service/src/groups/interfaces/group-message.interface';
import { CreateGroupDto } from '../../../../chat-service/src/groups/dto/create-group.dto';
import { SendGroupMessageDto } from '../../../../chat-service/src/groups/dto/send-group-message.dto';

const usersBaseUrl = `http://localhost:3000`;
const baseUrl = `http://localhost:3001`;

const secondUserGroupMessage = 'its a secondUserGroupMessage';

describe('group-create e2e', () => {
  let secondUserId: string;

  let firstUserAccessToken: string;
  let secondUserAccessToken: string;

  let firstUserSocket: Socket;
  let secondUserSocket: Socket;

  let groupId: string;

  beforeAll(async () => {
    const firstUserData = await testCreateUser(
      getRandomUserData(),
      usersBaseUrl
    );
    firstUserAccessToken = firstUserData.accessToken;

    const secondUserData = await testCreateUser(
      getRandomUserData(),
      usersBaseUrl
    );
    secondUserId = secondUserData.userId;
    secondUserAccessToken = secondUserData.accessToken;

    firstUserSocket = await testConnectToSocket({
      baseUrl,
      access_token: firstUserAccessToken,
    });
    secondUserSocket = await testConnectToSocket({
      baseUrl,
      access_token: secondUserAccessToken,
    });
  });

  afterAll(() => {
    firstUserSocket.disconnect();
    secondUserSocket.disconnect();
  });

  test('user can create group with participants', async () => {
    const [userAddedToGroupPromise, resolveUserAddedToGroupCb] =
      getPromiseWithResolveCb('userAddedToGroup', 2000);

    secondUserSocket.once(
      TransportTopics.userAddedToGroup,
      (createdGroupId) => {
        if (groupId) {
          expect(groupId).toBe(createdGroupId);
        } else {
          groupId = createdGroupId;
        }
        resolveUserAddedToGroupCb(0);
      }
    );

    const createdGroupId = await userSocketCreateGroup(
      firstUserSocket,
      [secondUserId],
      1000
    );
    expect(typeof createdGroupId).toBe('string');
    if (groupId) {
      expect(groupId).toBe(createdGroupId);
    } else {
      groupId = createdGroupId;
    }

    await userAddedToGroupPromise;
  });

  test('users in same group can send and receive group messages', async () => {
    const [groupMessageSentPromise, resolveGroupMessageSentCb] =
      getPromiseWithResolveCb('groupMessageSent', 2000);

    firstUserSocket.once(
      TransportTopics.groupMessageSent,
      (data: GroupMessageInterface) => {
        expect(data.groupId).toBe(groupId);
        expect(data.senderId).toBe(secondUserId);
        expect(data.message).toBe(secondUserGroupMessage);
        resolveGroupMessageSentCb();
      }
    );
    const groupMessageToBeSent: SendGroupMessageDto = {
      message: secondUserGroupMessage,
      groupId: groupId,
    };
    secondUserSocket.emit(
      TransportTopics.sendGroupMessage,
      groupMessageToBeSent
    );

    await groupMessageSentPromise;
  });
});
