import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistsController } from './wishlists.controller';
import { WishlistsService } from './wishlists.service';
import { WishesModule } from 'src/wishes/wishes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wishlist]),
    forwardRef(() => WishesModule),
  ],
  providers: [WishlistsService],
  controllers: [WishlistsController],
  exports: [WishlistsService],
})
export class WishlistsModule {}
