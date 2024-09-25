// Define a function to create a user
import { User } from '@ws-chat/db-models';
import http from 'k6/http';

export function testCreateUser(userData: User, baseUrl: string) {
  // Send a POST request to the user creation endpoint
  const url = `${baseUrl}/api/users`;
  const params = {
    headers: {
      'Content-Type': 'application/json', // Set the content type to JSON
    },
  };

  // Make the HTTP POST request with the user data
  const response = http.post(url, JSON.stringify(userData), params);

  if (!response.body) {
    return null;
  }

  console.log('response', response.body.toString());

  const responseBody = JSON.parse(response.body.toString());
  return {
    userId: responseBody.userId,
    accessToken: responseBody.accessToken,
  };
}

export function getRandomUserData(): User {
  return {
    email: `asdf${Math.random()}@gmail.com`,
    password: 'aaaaaaaaaaaaaa',
  };
}
