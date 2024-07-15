import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { AuthUser } from 'src/utils/decorators/user.decorator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
// import { Wish } from 'src/wishes/entities/wish.entity';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  // + Авторизация (логин)
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  login(@AuthUser() user): Promise<any> {
    console.log(user);

    return this.authService.login(user);
  }

  // + Регистрация:
  // получаю данные, создаю пользователя и возвращаю его с обновленным паролем
  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.signup(createUserDto);
    return user;
  }
}
