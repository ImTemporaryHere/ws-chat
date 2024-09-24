import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { ApiException } from "../exeptions/api-exception";
import { UsersService } from "./users.service";

export class UserController {
  constructor(private readonly usersService: UsersService) {}

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(
          ApiException.badRequestError("validation errors", errors.array()),
        );
      }

      const { userId, accessToken, refreshToken } =
        await this.usersService.registerUser(req.body);
      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({ userId, accessToken });
    } catch (e) {
      next(e);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        ApiException.badRequestError("validation errors", errors.array()),
      );
    }

    await this.usersService.deleteOne(req.params.userId);

    res.status(204).send();
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return next(
          ApiException.badRequestError("validation errors", errors.array()),
        );
      }

      const { userId, accessToken, refreshToken } =
        await this.usersService.login(req.body);
      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({ userId, accessToken });
    } catch (e) {
      next(e);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      // Handle get users logic here
      const users = await this.usersService.getUsers();
      res.send(users);
    } catch (e) {
      next(e);
    }
  }
}
