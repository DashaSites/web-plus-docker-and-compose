import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Wishlist } from './entities/wishlist.entity';
import { AuthUser } from 'src/utils/decorators/user.decorator';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { User } from 'src/users/entities/user.entity';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

@Controller('wishlistlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  // + Создать вишлист
  @Post()
  @UseGuards(JwtAuthGuard)
  createWishlist(
    @Body() createWishlistDto: CreateWishlistDto,
    @AuthUser() user: User,
  ): Promise<Wishlist> {
    return this.wishlistsService.create(createWishlistDto, user);
  }

  // + Найти все вишлисты
  @Get()
  @UseGuards(JwtAuthGuard)
  findAllWishlists(): Promise<Wishlist[]> {
    return this.wishlistsService.getAllWishlists();
  }

// + Найти вишлист по id
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findWishlistById(@Param('id') id: number) {
    return this.wishlistsService.getWishlistById(id);
  }

  // Отредактировать вишлист, найденный по id
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  editWishlistById(
    @Param('id') id: number,
    @Body() updateWishlistDto: UpdateWishlistDto,
    @AuthUser() user: User,
  ) {
    const userId = user.id;
    return this.wishlistsService.editWishlist(id, updateWishlistDto, userId);
  }

  // + Удалить репозиторий по id
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteWishlistById(@Param('id') id: number, @AuthUser() user: User) {
    const userId = user.id;
    return this.wishlistsService.deleteWishlist(id, userId);
  }
}
