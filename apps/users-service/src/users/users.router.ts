import express, { Router } from 'express';
import { getAuthMiddleware } from '../middlewares/auth-middleware';
import { body } from 'express-validator';
import { UserController } from './users.controller';
import { AuthService } from '../../../../libs/auth/src/lib/auth.service';

export function UsersRouter(
  userController: UserController,
  authService: AuthService
) {
  return express
    .Router({ mergeParams: true })
    .post(
      '/users',
      body('email').isEmail(),
      body('password').isLength({ min: 3, max: 20 }),
      userController.createUser.bind(userController)
    )
    .delete(
      '/users/:userId',
      getAuthMiddleware(authService),
      userController.deleteUser.bind(userController)
    )
    .get(
      '/users',
      getAuthMiddleware(authService),
      userController.getUsers.bind(userController)
    )
    .post(
      '/login',
      body('email').isEmail(),
      body('password').isLength({ min: 3, max: 20 }),
      userController.login.bind(userController)
    );
}
