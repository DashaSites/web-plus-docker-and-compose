import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { AuthUser } from 'src/utils/decorators/user.decorator';
import { CreateWishDto } from './dto/create-wish.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { UpdateWishDto } from './dto/update-wish.dto';
import { User } from 'src/users/entities/user.entity';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  // + Добавить подарок
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createWishDto: CreateWishDto, @AuthUser() user) {
    return this.wishesService.create(createWishDto, user.id);
  }
  // + Вернуть 40 недавно добавленных подарков
  @Get('last')
  findLastWishes() {
    return this.wishesService.getLastWishes();
  }

  // + Вернуть 20 подарков, которые копируют больше всего
  @Get('top')
  findTopWishes() {
    return this.wishesService.getTopWishes();
  }

  // + Найти подарок по его id
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findWishByWishId(@Param('id') id: number) {
    return this.wishesService.getWishByWishId(id);
  }

  // + Копировать желание к себе
  @Post(':id/copy')
  @UseGuards(JwtAuthGuard)
  copy(@Param() params: any, @AuthUser() user) {
    return this.wishesService.copy(params.id, user.id);
  }

  // + Редактировать желание
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updateWishById(
    @Param('id') id: number,
    @Body() updateWishDto: UpdateWishDto,
    @AuthUser() user: User,
  ) {
    const userId = user.id;
    return this.wishesService.updateWish(id, updateWishDto, userId);
  }

  // + Удалить желание
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteWishById(@Param('id') id: number, @AuthUser() user: User) {
    const userId = user.id;
    return this.wishesService.deleteWish(id, userId);
  }
}
