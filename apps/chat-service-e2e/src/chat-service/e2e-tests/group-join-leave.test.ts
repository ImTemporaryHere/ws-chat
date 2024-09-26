import { io, Socket } from 'socket.io-client';
import {
  getRandomUserData,
  testConnectToSocket,
  testCreateUser,
  userSocketCreateGroup,
} from '@ws-chat/test-utils';
import { TransportTopics } from '../../../../chat-service/src/transports/transport-topics';
import { UserJoinGroupPayload } from '../../../../chat-service/src/groups/interfaces/user-join-group-payload.interface';
import { GroupMessageInterface } from '../../../../chat-service/src/groups/interfaces/group-message.interface';

const usersBaseUrl = `http://localhost:3000`;
const baseUrl = `http://localhost:3001`;

describe('group-join-leave e2e', () => {
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

    groupId = await userSocketCreateGroup(firstUserSocket, [], 1000);
  });

  afterAll(() => {
    firstUserSocket.disconnect();
    secondUserSocket.disconnect();
  });

  test('user can join already created group', async () => {
    const userAddedToGroupPromise = new Promise((resolve, reject) => {
      secondUserSocket.once(
        TransportTopics.userJoinedGroup,
        ({ groupId: joinedGroupId }: UserJoinGroupPayload) => {
          expect(joinedGroupId).toBe(groupId);
          resolve(0);
        }
      );
    });

    secondUserSocket.emit(TransportTopics.joinGroup, groupId);

    await userAddedToGroupPromise;
  });

  test('user can leave group', (cb) => {
    const expectedMessage = `user ${secondUserId} left the group`;

    firstUserSocket.once(
      TransportTopics.groupMessageSent,
      ({ message, groupId }: GroupMessageInterface) => {
        expect(message).toBe(expectedMessage);
        expect(groupId).toBe(groupId);
        cb();
      }
    );

    secondUserSocket.emit(TransportTopics.leaveGroup, groupId);
  });
});
