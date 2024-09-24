import { UsersRepository } from "./users.repository";
import { User } from '@./db-models';
import { AuthService } from "./auth.service";
import { ApiException } from "../exeptions/api-exception";

export class UsersService {
  constructor(
    private readonly authService: AuthService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async registerUser(user: User): Promise<{
    accessToken: string;
    userId: string;
    refreshToken: string;
  }> {
    try {
      const hashedPassword = await this.authService.hashPassword(user.password);

      const createdUser = await this.usersRepository.create({
        ...user,
        password: hashedPassword,
      });

      const { accessToken, refreshToken } = this.authService.generateTokens({
        userId: createdUser._id.toString(),
      });

      return {
        accessToken,
        refreshToken,
        userId: createdUser._id.toString(),
      };
    } catch (e: any) {
      if (e.code === 11000) {
        throw ApiException.badRequestError("duplicate email");
      }
      throw e;
    }
  }

  async login(userData: User) {
    const existingUser = await this.usersRepository.findOne({
      email: userData.email,
    });

    if (!existingUser) {
      throw ApiException.badRequestError("no existingUser with this email");
    }

    const checkPassword = this.authService.verifyPassword(
      userData.password,
      existingUser.password,
    );

    if (!checkPassword) {
      throw ApiException.badRequestError("not correct password");
    }

    const { accessToken, refreshToken } = this.authService.generateTokens({
      userId: existingUser._id.toString(),
    });

    return {
      accessToken,
      refreshToken,
      userId: existingUser._id.toString(),
    };
  }

  getUsers() {
    return this.usersRepository.find();
  }

  deleteOne(userId: string) {
    return this.usersRepository.deleteOne(userId);
  }
}
