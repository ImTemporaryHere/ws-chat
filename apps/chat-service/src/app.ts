import mongoose from 'mongoose';
import { Server as IoServer, Socket } from 'socket.io';
import { createAdapter, RedisAdapter } from 'socket.io-redis';
import { Redis } from 'ioredis';
import { SocketIoTransport } from './transports/socketio.transport';
import { GroupsController } from './groups/groups.controller';
import { GroupsService } from './groups/groups.service';
import { GroupsRepository } from './groups/groups.repository';
import { registerGroupHandlers } from './groups/groups.event-handlers';
import { UserSocketsMapper } from './transports/sokets-mapper';
import { getAuthSocketMiddleware } from './middlewares/socketio-auth-middleware';
import { getSocketIoUserMapperMiddleware } from './middlewares/socketio-user-mapper-middleware';
import { IocContainer } from './ioc-container/container';
import { App } from 'uWebSockets.js';
import { AuthService } from '@ws-chat/auth';

export async function runApp() {
  try {
    const container = IocContainer.getInstance();

    const app = App();
    const port = process.env.PORT || 3001;
    const pubClient = new Redis({
      host: process.env.REDIS_HOST as string,
      port: Number(process.env.REDIS_PORT as string),
    });
    const subClient = pubClient.duplicate();

    const io = new IoServer({
      adapter: createAdapter({ pubClient, subClient }),
    });

    io.attachApp(app);

    container.register('AuthService', AuthService);
    //groups
    container.register('io', () => io);
    container.register('GroupsRepository', GroupsRepository);
    container.register('UserSocketsMapper', UserSocketsMapper);
    container.register('Transport', SocketIoTransport, [
      'UserSocketsMapper',
      'io',
    ]);
    container.register('GroupsService', GroupsService, [
      'GroupsRepository',
      'Transport',
    ]);
    container.register('GroupsController', GroupsController, ['GroupsService']);

    io.use(getAuthSocketMiddleware(container.get('AuthService')));
    io.use(getSocketIoUserMapperMiddleware(container.get('UserSocketsMapper')));
    io.on('connection', registerHandlers);

    mongoose.connection.on('error', (err: any) => {
      console.error('Failed to connect to MongoDB', err);
    });

    // MongoDB Connection URI
    const mongoURI = process.env.MONGODB_URI as string;
    console.log('mongo', mongoURI);
    // Connect to MongoDB using Mongoose
    await mongoose.connect(mongoURI);

    console.log('Connected to MongoDB');

    app.listen(+port, (token) => {
      if (!token) {
        console.warn('port already in use');
      }
      console.log(`[server]: Server is running at http://localhost:${port}`);
    });

    process.on('SIGTERM', async () => {
      console.log('SIGTERM signal received: closing HTTP server');
      await stopService();
    });

    return stopService;

    async function stopService() {
      await new Promise((resolve, reject) => {
        io.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve(0);
          }
        });
      });
      console.log('io server closed');

      await mongoose.connection.close();
      console.log('db connection closed');
      process.exit(0);
    }

    function registerHandlers(socket: Socket) {
      registerGroupHandlers(socket, container.get('GroupsController'));
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
}
