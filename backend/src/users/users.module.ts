import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Wish } from 'src/wishes/entities/wish.entity';
import { AuthModule } from 'src/auth/auth.module';
import { WishesModule } from 'src/wishes/wishes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Wish]),
    forwardRef(() => AuthModule),
    forwardRef(() => WishesModule),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
