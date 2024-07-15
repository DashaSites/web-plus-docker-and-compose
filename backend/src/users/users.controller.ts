import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { AuthUser } from 'src/utils/decorators/user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { Wish } from 'src/wishes/entities/wish.entity';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ILike } from 'typeorm';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  // + Нахожу всех пользователей
  @Get('all')
  getUsers(): Promise<User[]> {
    return this.usersService.getAllUsers();
  }

  // + Смотреть инфу о себе (авторизованном пользователе)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async findOne(@AuthUser() user: User): Promise<User> {
    // findOne - метод, описанный внутри сервиса UsersService
    return this.usersService.findOne({
      where: { id: user.id }, // а без @AuthUser было бы { id: req.user.id }
      select: {
        email: true,
        username: true,
        id: true,
        avatar: true,
        about: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // + Вернуть все мои желания
  @UseGuards(JwtAuthGuard)
  @Get('me/wishes')
  async findMyWishes(@AuthUser() user: User): Promise<Wish[]> {
    const userId = user.id;
    return await this.usersService.getMyWishes(userId);
  }

  // + Редактировать мой профиль
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMyProfile(
    @AuthUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    console.log(user);
    const { id } = user;
    return this.usersService.updateMyProfile(id, updateUserDto);
  }

  // + Найти профиль по имени пользователя
  @UseGuards(JwtAuthGuard)
  @Get(':username')
  findUserByUsername(@Param('username') username: string) {
    return this.usersService.getUserByUsername(username);
  }

  // + Найти все желания пользователя с таким-то именем
  @UseGuards(JwtAuthGuard)
  @Get(':username/wishes')
  findUserWishesByUsername(@Param('username') username: string) {
    return this.usersService.getUserWishesByUsername(username);
  }

  // + Поиск многих пользователей по username или email
  @UseGuards(JwtAuthGuard)
  @Post('find')
  findUserByUsernameOrEmail(@Body('query') query: string) {
    return this.usersService.findMany(query);
  }
}
