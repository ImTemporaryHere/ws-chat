// src/index.js
import express, { Express, Request, Response } from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { errorMiddleware } from './middlewares/error-middleware';
import { createServer } from 'http';
import { UsersService } from './users/users.service';
import { UsersRepository } from './users/users.repository';
import { AuthService } from './users/auth.service';
import { IocContainer } from './ioc-container/container';
import { UserController } from './users/users.controller';
import { UsersRouter } from './users/users.router';

export async function runApp() {
  try {
    const container = IocContainer.getInstance();

    const app: Express = express();
    const port = process.env.PORT || 3000;
    const httpServer = createServer(app);

    container.register('UsersRepository', UsersRepository);
    container.register('AuthService', AuthService);
    container.register('UsersService', UsersService, [
      'AuthService',
      'UsersRepository',
    ]);
    container.register('UserController', UserController, ['UsersService']);

    // Middleware to parse JSON requests
    app.use(express.json());
    app.use(cookieParser());
    app.use(cors());
    app.use('/api', [
      UsersRouter(
        container.get('UserController'),
        container.get('AuthService')
      ),
    ]);
    app.use(errorMiddleware);

    mongoose.connection.on('error', (err: any) => {
      console.error('Failed to connect to MongoDB', err);
    });

    // MongoDB Connection URI
    const mongoURI = process.env.MONGODB_URI as string;
    console.log('mongoURI', mongoURI);
    // Connect to MongoDB using Mongoose
    await mongoose.connect(mongoURI);

    console.log('Connected to MongoDB');

    httpServer.listen(port, () => {
      console.log(
        `[auth service]: Server is running at http://localhost:${port}`
      );
    });

    process.on('SIGTERM', async () => {
      console.log('SIGTERM signal received: closing HTTP server');
      await stopService();
    });

    return stopService;

    async function stopService() {
      await mongoose.connection.close();
      console.log('db connection closed');
      process.exit(0);
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
}
