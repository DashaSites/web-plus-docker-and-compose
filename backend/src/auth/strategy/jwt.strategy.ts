import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';

// Сервис-стратегия для того, чтобы защитить мои контроллеры
// guard'ом там, где юзер должен быть авторизован
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secretKey'),
    });
  }

  validate(payload: any) {
    // ищем данную сущность в базе данных методом findById
    return this.userService.findById(payload.sub);
  }
}
