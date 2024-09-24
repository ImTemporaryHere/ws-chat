import { User } from '@./db-models';
import request from 'supertest';

export async function testCreateUser(
  userData: User,
  baseUrl: string
): Promise<{ userId: string; accessToken: string }> {
  const response = await request(baseUrl)
    .post('/api/users')
    .send(userData)
    .expect(201);

  return response.body;
}

export async function deleteUser(
  baseUrl: string,
  userId: string,
  accessToken: string
) {
  await request(baseUrl)
    .delete(`/api/users/${userId}`)
    .set('Authorization', `Bearer ${accessToken}`)
    .expect(204);
}
