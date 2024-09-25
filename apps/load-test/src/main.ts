import ws from 'k6/ws';
import { check } from 'k6';
import { makeConnection } from './libs/socket-io';
import { checkForEventMessages } from './libs/socket-io';
import { socketResponseCode, socketResponseType } from './libs/constants';
import { Trend } from 'k6/metrics';
import { testCreateUser, getRandomUserData } from './utils';
import { TransportTopics } from '../../chat-service/src/transports/transport-topics';
import { CreateGroupDto } from '../../chat-service/src/groups/dto/create-group.dto';

export const options = {
  vus: 1, // Number of virtual users
  // duration: '3s',
  iterations: 1, // Run only one iteration
  tags: {
    testName: 'socketsio poc',
  },
};

// this trend will show up in the k6 output results
let messageTime = new Trend('socketio_message_duration_ms');

export default async function startTesting() {
  const usersServiceBaseUrl = 'http://localhost:3000';
  const chatServiceDomain = `localhost:3001`;

  const firstUserData = testCreateUser(
    getRandomUserData(),
    usersServiceBaseUrl
  );

  // const secondUserData =  testCreateUser(
  //   getRandomUserData(),
  //   usersServiceBaseUrl
  // );

  let startTime = 0;
  let endTime = 0;

  const sid = makeConnection(chatServiceDomain, {
    Authorization: firstUserData.accessToken,
  });

  // Let's do some websockets
  const url = `ws://${chatServiceDomain}/socket.io/?EIO=4&transport=websocket&sid=${sid}`;

  const response = ws.connect(
    url,
    {
      headers: {
        Authorization: firstUserData.accessToken,
      },
    },
    function (socket) {
      socket.on('open', function open() {
        console.log('connected');
        socket.send('2probe');
        socket.send('5');
        socket.send('3');

        // send an event message
        startTime = Date.now();

        const createGroupData: CreateGroupDto = {
          name: 'just a new group',
          participantsId: [],
        };

        socket.send(
          `42${JSON.stringify([TransportTopics.createGroup, createGroupData])}`
        );

        // socket.setInterval(function timeout() {
        //   socket.ping();
        //   console.log('Pinging every 1sec (setInterval test)');
        // }, 1000 * 5);
      });

      // This will constantly poll for any messages received
      socket.on('message', function incoming(msg) {
        // checking for event messages
        checkForEventMessages<string[]>(msg, function (messageData) {
          endTime = Date.now();
          console.log(`
          I've received an event message!
          message=${messageData[1]}
          vu=${__VU.toString()}
          iter=${__ITER.toString()}
          time=${Date.now().toString()}
        `);
        });
      });

      socket.on('close', function close() {
        console.log('disconnected');
      });

      socket.on('error', function (e) {
        console.log('error', JSON.stringify(e));
        if (e.error() != 'websocket: close sent') {
          console.log('An unexpected error occured: ', e.error());
        }
      });

      socket.setTimeout(() => {
        console.log('2 seconds passed, closing the socket');
        socket.close();
      }, 1000 * 2);
    }
  );

  check(response, { 'status is 101': (r) => r && r.status === 101 });

  // Log message time
  messageTime.add(endTime - startTime);

  await new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });
}
