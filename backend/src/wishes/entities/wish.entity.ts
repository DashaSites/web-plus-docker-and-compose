import { IsNumber, IsUrl, Length } from 'class-validator';
import { Offer } from 'src/offers/entities/offer.entity';
import { User } from 'src/users/entities/user.entity';
import { Wishlist } from 'src/wishlists/entities/wishlist.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
} from 'typeorm';

@Entity()
export class Wish {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  @Length(1, 250, {
    message: 'Name needs to be between 1 and 250 characters',
  })
  name: string;

  @Column()
  @IsUrl()
  link: string;

  @Column()
  @IsUrl()
  image: string;

  @Column('decimal', { scale: 2 })
  @IsNumber()
  price: number;

  @Column('decimal', { scale: 2, default: 0 })
  @IsNumber()
  raised: number;

  @Column()
  @Length(1, 1024, {
    message: 'The wish description needs to be between 1 and 1024 characters',
  })
  description: string;

  // ссылка на пользователя, который добавил пожелание подарка
  @ManyToOne(() => User, (user) => user.wishes)
  owner: User;

  // Массив ссылок на заявки скинуться от других пользователей
  @OneToMany(() => Offer, (offer) => offer.item)
  offers: Offer[];

  // Cодержит cчётчик тех, кто скопировал подарок себе. Целое десятичное число
  @Column('integer', { default: 0 })
  @IsNumber()
  copied: number;

  // Ссылка на все вишлисты, где фигурирует желание
  @ManyToMany(() => Wishlist, (wishlist) => wishlist.items)
  wishlists: Wishlist[];
}
