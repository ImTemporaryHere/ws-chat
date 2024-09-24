import { UsersRepository } from "../users/users.repository";
import { AuthService } from "../users/auth.service";
import { UsersService } from "../users/users.service";
import { UserController } from "../users/users.controller";

export type ServiceTypes = {
  UsersRepository: UsersRepository;
  AuthService: AuthService;
  UsersService: UsersService;
  UserController: UserController;
};
