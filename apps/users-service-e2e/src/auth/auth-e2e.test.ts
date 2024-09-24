import request from 'supertest';
import {
  deleteUser,
  getRandomUserData,
  testCreateUser,
} from '@ws-chat/test-utils';

const baseUrl = `http://localhost:3000`;

const firstUserAuthData = getRandomUserData();
const secondUserAuthData = getRandomUserData();

describe('auth E2E Tests', () => {
  let firstUserId: string;
  let firstUserAccessToken: string;

  let secondUserId: string;
  let secondUserAccessToken: string;
  test('Create first user', async () => {
    const { accessToken, userId } = await testCreateUser(
      firstUserAuthData,
      baseUrl
    );
    expect(typeof userId).toBe('string');
    expect(typeof accessToken).toBe('string');
    firstUserId = userId;
    firstUserAccessToken = accessToken;
  });

  test('Create second user', async () => {
    // Create users
    const { accessToken, userId } = await testCreateUser(
      secondUserAuthData,
      baseUrl
    );

    secondUserId = userId;
    secondUserAccessToken = accessToken;
  });

  test('user with existing email cant be created', async () => {
    // Create users
    const response = await request(baseUrl)
      .post('/api/users')
      .send(secondUserAuthData)
      .expect(400);

    expect(response.body.message).toBe('duplicate email');
  });

  test('user can log in', async () => {
    const response = await request(baseUrl)
      .post('/api/login')
      .send(secondUserAuthData)
      .expect(200);

    const { userId, accessToken } = response.body;
    expect(userId).toBe(secondUserId);
    expect(typeof accessToken).toBe('string');
  });

  test('not authenticated user cant access protected route', async () => {
    await request(baseUrl).get('/api/users').expect(401);
  });

  test('authenticated user can access protected route', async () => {
    await request(baseUrl)
      .get('/api/users')
      .set('Authorization', `Bearer ${secondUserAccessToken}`)
      .expect(200);
  });

  test('users can be deleted', async () => {
    await Promise.allSettled([
      deleteUser(baseUrl, firstUserId, firstUserAccessToken),
      deleteUser(baseUrl, secondUserId, secondUserAccessToken),
    ]);
  });
});
