/* eslint-disable */
import { config } from 'dotenv';
console.log('node-env', process.env.NODE_ENV);
config({ path: `envs/test/.env.${process.env.NODE_ENV}` });
import { registerTsProject } from '@nx/js/src/internal';
const cleanupRegisteredPaths = registerTsProject('./tsconfig.base.json');
import { runApp } from '../../../auth/src/app';

module.exports = async function () {
  // Start services that that the app needs to run (e.g. database, docker-compose, etc.).
  console.log('\nSetting up...\n');
  globalThis.__stopServiceCallback__ = await runApp();

  // make sure to run the clean up!
  cleanupRegisteredPaths();
};
