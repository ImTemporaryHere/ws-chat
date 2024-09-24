import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const saltRounds = 10;

export type TokenPayload = {
  userId: string;
};

export class AuthService {
  hashPassword(password: string) {
    return bcrypt.hash(password, saltRounds);
  }

  verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateTokens(payload: TokenPayload) {
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_ACCESS_SECRET as string,
      {
        expiresIn: "8h",
      },
    );

    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET as string,
      {
        expiresIn: "7d",
      },
    );

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string) {
    try {
      return jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);
    } catch (e) {
      return null;
    }
  }

  verifyRefreshToken(token: string) {
    try {
      return jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);
    } catch (e) {
      return null;
    }
  }
}
