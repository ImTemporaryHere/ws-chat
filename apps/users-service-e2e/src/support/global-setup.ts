/* eslint-disable */
import { registerTsProject } from '@nx/js/src/internal';
const cleanupRegisteredPaths = registerTsProject('./tsconfig.base.json');
import { config } from 'dotenv';
console.log('node-env', process.env.NODE_ENV);
config({ path: `envs/users-service/test/.env.${process.env.NODE_ENV}` });
import { runApp } from '../../../users-service/src/app';

module.exports = async function () {
  globalThis.__stopServiceCallback__ = await runApp();

  // make sure to run the clean up!
  cleanupRegisteredPaths();
};
