import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt/dist';
import { matchPassword } from 'src/helpers/password-helpers.helper';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne({
      select: { username: true, password: true, id: true },
      where: { username },
    });

    if (user && (await matchPassword(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // + Авторизация при логине
  async login(user: User) {
    const { username, id: sub } = user;

    return {
      access_token: await this.jwtService.signAsync({ username, sub }),
    };
  }
}
