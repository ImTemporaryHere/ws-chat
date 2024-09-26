import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { makeConnection, socketSendMessage } from './libs/socket-io';
import { checkForEventMessages } from './libs/socket-io';
import { Trend } from 'k6/metrics';
import { testCreateUser, getRandomUserData } from './utils';
import { TransportTopics } from '../../chat-service/src/transports/transport-topics';
import { CreateGroupDto } from '../../chat-service/src/groups/dto/create-group.dto';
import { SendGroupMessageDto } from '../../chat-service/src/groups/dto/send-group-message.dto';

export const options = {
  vus: 100, // Number of virtual users
  duration: '3s',
  // iterations: 1, // Run only one iteration
  tags: {
    testName: 'socketsio poc',
  },
};

// this trend will show up in the k6 output results
const messageTime = new Trend('socketio_message_response_time');

export default async function startTesting() {
  const usersServiceBaseUrl = 'http://localhost:3000';
  const chatServiceDomain = `localhost:3001`;

  const data = testCreateUser(getRandomUserData(), usersServiceBaseUrl);
  const sid = makeConnection(chatServiceDomain, {
    Authorization: data.accessToken,
  });
  // Let's do some websockets
  const wsUrl = `ws://${chatServiceDomain}/socket.io/?EIO=4&transport=websocket&sid=${sid}`;

  ws.connect(
    wsUrl,
    {
      headers: {
        Authorization: data.accessToken,
      },
    },
    socketConnectHandler
  );

  // check(response, { 'status is 101': (r) => r && r.status === 101 });

  // Sleep to allow for response time
  // sleep(2);

  function socketConnectHandler(socket: ws.Socket) {
    socket.setTimeout(() => {
      console.warn('timeout , closing socket');
      socket.close();
    }, 1000);

    socket.on(
      'open',
      socketOpenHandler({
        socket: socket,
      })
    );

    // This will constantly poll for any messages received
    socket.on('message', socketIncomingMessageHandler({ socket: socket }));

    socket.on('close', function close() {
      // console.log('disconnected');
    });

    socket.on('error', function (e) {
      console.log('error', e);
      if (e.error() != 'websocket: close sent') {
        console.log('An unexpected error occured: ', e.error());
      }
    });
  }

  function socketOpenHandler({ socket }: { socket: ws.Socket }) {
    return () => {
      // console.log('connected');
      socket.send('2probe');
      socket.send('5');
      socket.send('3');

      const createGroupData: CreateGroupDto = {
        name: 'just a new group',
        participantsId: [],
      };

      // send an event message
      socketSendMessage({
        socket,
        eventName: TransportTopics.createGroup,
        dataArgs: [createGroupData],
      });
    };
  }

  function socketIncomingMessageHandler({ socket }: { socket: ws.Socket }) {
    let sentMessageTime = 0;
    let createdGroupId = '';

    return (msg: string) => {
      // checking for event messages
      checkForEventMessages<string[]>(msg, (messageData) => {
        // console.log('socketIncomingMessageHandler', messageData);

        switch (messageData[0]) {
          case TransportTopics.groupCreated: {
            createdGroupId = messageData[1];

            const groupMessageToBeSent: SendGroupMessageDto = {
              message: 'dummy message',
              groupId: createdGroupId,
            };

            sentMessageTime = Date.now();
            socketSendMessage({
              socket,
              eventName: TransportTopics.sendGroupMessage,
              dataArgs: [groupMessageToBeSent],
            });

            break;
          }

          case TransportTopics.groupMessageSent: {
            if ((messageData[1] as any).groupId === createdGroupId) {
              messageTime.add(Date.now() - sentMessageTime);

              socket.close();
            }

            break;
          }
        }
      });
    };
  }
}
