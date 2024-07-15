import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
import { User } from 'src/users/entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';
import { UsersModule } from 'src/users/users.module';
import { WishesModule } from 'src/wishes/wishes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Offer, User, Wish]),
    forwardRef(() => UsersModule),
    forwardRef(() => WishesModule),
  ],
  providers: [OffersService],
  controllers: [OffersController],
  exports: [OffersService],
})
export class OffersModule {}
