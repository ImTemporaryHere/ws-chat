import { runApp } from './app';
import { config } from 'dotenv';

config({ path: `envs/users-service/.env.${process.env.NODE_ENV}` });

async function main() {
  try {
    await runApp();
  } catch (e) {
    console.error(e);
  }
}

main();
