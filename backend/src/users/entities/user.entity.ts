import { IsEmail, IsNotEmpty, IsUrl, Length } from 'class-validator';
import { Offer } from 'src/offers/entities/offer.entity';
import { Wish } from 'src/wishes/entities/wish.entity';
import { Wishlist } from 'src/wishlists/entities/wishlist.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ unique: true })
  @Length(2, 30, {
    message: 'Username needs to be between 2 and 30 characters',
  })
  @IsNotEmpty()
  username: string;

  @Column({ default: 'No info so far' })
  @Length(2, 30, {
    message: 'Info about you needs to contain between 2 and 200 characters',
  })
  about: string;

  @Column({ default: 'https://i.pravatar.cc/300' })
  @IsUrl()
  avatar: string;

  @Column({ unique: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Column({ select: false })
  @IsNotEmpty()
  password: string;

  // Желания
  @OneToMany(() => Wish, (wish) => wish.owner)
  wishes: Wish[];

  // Список подарков, на которые скидывается пользователь
  @OneToMany(() => Offer, (offer) => offer.user)
  offers: Offer[];

  // Cписок вишлистов, которые создал пользователь
  @OneToMany(() => Wishlist, (wishlist) => wishlist.owner)
  wishlists: Wishlist[];
}
