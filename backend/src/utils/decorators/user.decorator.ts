import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';

// С помощью createParamDecorator создаем декораторы, которые
// будут использоваться внутри параметров наших методов

// AuthUser получает доступ к объекту Request и достает оттуда поле user
export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();

    return request.user;
  },
);
