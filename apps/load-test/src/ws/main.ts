import ws from 'k6/ws';
import { check, fail, sleep } from 'k6';
import { makeConnection, socketSendMessage } from './libs/socket-io';
import { checkForEventMessages } from './libs/socket-io';
import { Trend } from 'k6/metrics';
import { TransportTopics } from '../../../chat-service/src/transports/transport-topics';
import { SendGroupMessageDto } from '../../../chat-service/src/groups/dto/send-group-message.dto';

export const options = {
  vus: __ENV.vus, // Number of virtual users
  // duration: '3s',
  iterations: +__ENV.vus, // Run only one iteration
  tags: {
    testName: 'socketsio poc',
  },
};

// this trend will show up in the k6 output results
const messageTime = new Trend('socketio_message_response_time');

export default async function startTesting() {
  try {
    const chatServiceDomain = `localhost:3001`;

    const vuNumber = __VU; // Get the VU number

    const { createdGroupId, accessToken } = JSON.parse(
      __ENV[`user_${vuNumber}`]
    );

    const sid = makeConnection(chatServiceDomain, {
      Authorization: accessToken,
    });
    // Let's do some websockets

    const wsUrl = `ws://${chatServiceDomain}/socket.io/?EIO=4&transport=websocket&sid=${sid}`;

    const response = ws.connect(
      wsUrl,
      {
        headers: {
          Authorization: __ENV.USER_ACCESS_TOKEN,
        },
      },
      socketConnectHandler
    );

    check(response, { 'status is 101': (r) => r && r.status === 101 });

    // Sleep to allow for response time
    // sleep(2);

    function socketConnectHandler(socket: ws.Socket) {
      // socket.setTimeout(() => {
      //   console.warn('timeout , closing socket');
      //   socket.close();
      // }, 1000);
      // throw new Error('test error');

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

        // send an event message
        socketSendMessage({
          socket,
          eventName: TransportTopics.joinGroup,
          dataArgs: [createdGroupId],
        });
      };
    }

    function socketIncomingMessageHandler({ socket }: { socket: ws.Socket }) {
      let sentMessageTime = 0;

      return (msg: string) => {
        // checking for event messages
        checkForEventMessages<string[]>(msg, (messageData) => {
          // console.log('socketIncomingMessageHandler', messageData);

          switch (messageData[0]) {
            case TransportTopics.userJoinedGroup: {
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
  } catch (e) {
    const fieldName = 'error occurred during testing: ' + e.toString();
    check(e, { [fieldName]: (e) => false });
  }
}
