import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { UserDocument } from 'src/database/schemas/user.schema';
import AuthorizationError from 'src/errors/AuthorizationError';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ username });
    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return user;
    }
    return null;
  }

  async doesUsernameExist(username: string): Promise<boolean> {
    const user = await this.userModel.findOne({ username });
    return Boolean(user);
  }

  async register(username: string, password: string): Promise<any> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.userModel.create({
      username,
      password: hashedPassword,
    });
    return newUser;
  }

  async login(user: UserDocument) {
    const payload = { username: user.username, _id: user._id, role: user.role };
    const accessToken = this.jwtService.sign(payload); // 15 minutes
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' }); // 7 days

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(oldRefreshToken: string) {
    try {
      const payload = this.jwtService.verify(oldRefreshToken);
      const newAccessToken = this.jwtService.sign(payload, {
        expiresIn: '15m',
      });
      return {
        accessToken: newAccessToken,
      };
    } catch (e) {
      throw new AuthorizationError();
    }
  }
}
