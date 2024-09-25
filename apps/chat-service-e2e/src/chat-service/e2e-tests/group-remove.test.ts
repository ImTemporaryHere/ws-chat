import { io, Socket } from 'socket.io-client';
import {
  getPromiseWithResolveCb,
  getRandomUserData,
  testCreateUser,
} from '@ws-chat/test-utils';
import { testConnectToSocket } from './sockeio-server-auth.test';
import { userSocketCreateGroup } from './group-create.test';
import { TransportTopics } from '../../../../chat-service/src/transports/transport-topics';
import { GroupMessageInterface } from '../../../../chat-service/src/groups/interfaces/group-message.interface';

const usersBaseUrl = `http://localhost:3000`;
const baseUrl = `http://localhost:3001`;

const secondUserGroupMessage = 'its a secondUserGroupMessage';

describe('group-remove e2e', () => {
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

    groupId = await userSocketCreateGroup(
      firstUserSocket,
      [secondUserId],
      1000
    );
  });

  afterAll(() => {
    firstUserSocket.disconnect();
    secondUserSocket.disconnect();
  });

  test('user can remove group', async () => {
    const [groupRemovedPromise, resolveGroupRemovedCb] =
      getPromiseWithResolveCb('groupRemoved', 2000);

    firstUserSocket.once(TransportTopics.groupRemoved, (removedGroupId) => {
      expect(removedGroupId).toBe(groupId);
      resolveGroupRemovedCb();
    });

    firstUserSocket.emit(TransportTopics.removeGroup, groupId);

    await groupRemovedPromise;
  });

  test("messages can't be delivered in removed group", async () => {
    const [groupMessageSentPromise, resolveGroupMessageSentCb] =
      getPromiseWithResolveCb('groupMessageSent', 2000);

    firstUserSocket.once(
      TransportTopics.groupMessageSent,
      (data: GroupMessageInterface) => {
        if (groupId === data.groupId) {
          throw new Error('message was delivered in removed group');
        }
      }
    );
    const groupMessageToBeSent: GroupMessageInterface = {
      message: secondUserGroupMessage,
      groupId: groupId,
      senderId: secondUserId,
    };
    secondUserSocket.emit(
      TransportTopics.sendGroupMessage,
      groupMessageToBeSent
    );
    setTimeout(() => {
      resolveGroupMessageSentCb();
    }, 1000);
    await groupMessageSentPromise;
  });
});
