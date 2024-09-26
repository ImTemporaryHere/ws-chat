import {
  getRandomUserData,
  testConnectToSocket,
  testCreateUser,
  userSocketCreateGroup,
} from '@ws-chat/test-utils';
import * as process from 'node:process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

const usersServiceBaseUrl = 'http://localhost:3000';
const chatServiceBaseUrl = `http://localhost:3001`;

const pathToEnvFile = path.resolve(__dirname, '.env');

const vus = parseInt(process.env.vus);
console.log(vus);
async function start() {
  await fs.rm(pathToEnvFile, { force: true });

  const usersToCreate = [];
  for (let i = 0; i < vus; ++i) {
    usersToCreate.push(i);
    if (usersToCreate.length === 40) {
      await Promise.allSettled(
        usersToCreate.map((userIndex) => createUserAndGroup(userIndex))
      );
      usersToCreate.length = 0;
    }
  }
  await Promise.all(
    usersToCreate.map((userIndex) => createUserAndGroup(userIndex))
  );

  process.exit(0);
}

start();

async function createUserAndGroup(index: number) {
  console.log(index);
  const { accessToken, userId } = await testCreateUser(
    getRandomUserData(),
    usersServiceBaseUrl
  );

  const userSocket = await testConnectToSocket({
    baseUrl: chatServiceBaseUrl,
    access_token: accessToken,
  });

  const createdGroupId = await userSocketCreateGroup(userSocket, [], 1000);

  userSocket.disconnect();

  await fs.appendFile(
    pathToEnvFile,
    `\nuser_${index + 1}=${JSON.stringify({
      accessToken,
      createdGroupId,
    })}`
  );
}
