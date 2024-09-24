import { User } from '@ws-chat/db-models';

export function getRandomUserData(): User {
  return {
    email: `asdf${Math.random()}@gmail.com`,
    password: 'aaaaaaaaaaaaaa',
  };
}

export function getPromiseWithResolveCb(promiseName: string, timeout: number) {
  let resolveCb;
  const promise = new Promise((res, rej) => {
    const _timeout = setTimeout(() => {
      rej(`${promiseName} timeout`);
    }, timeout);
    resolveCb = () => {
      clearTimeout(_timeout);
      res(0);
    };
  });
  return [promise, resolveCb];
}
