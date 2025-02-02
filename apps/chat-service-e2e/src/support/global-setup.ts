/* eslint-disable */
import { registerTsProject } from '@nx/js/src/internal';
const cleanupRegisteredPaths = registerTsProject('./tsconfig.base.json');
import { config } from 'dotenv';
import { runApp } from '../../../chat-service/src/app';
console.log('node-env', process.env.NODE_ENV);
config({ path: `envs/chat-service/test/.env.${process.env.NODE_ENV}` });

module.exports = async function () {
  globalThis.__stopServiceCallback__ = await runApp();

  // make sure to run the clean up!
  cleanupRegisteredPaths();
};
