/* eslint-disable */

import mongoose from 'mongoose';

module.exports = async function () {
  // Put clean up logic here (e.g. stopping services, docker-compose, etc.).
  // Hint: `globalThis` is shared between setup and teardown.
  try {
    await globalThis.__stopServiceCallback__();
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  } catch (e) {
    console.error(e);
  }
};
