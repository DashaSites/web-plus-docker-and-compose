import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { FindOneOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Wish } from './entities/wish.entity';
import { UsersService } from 'src/users/users.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishesRepository: Repository<Wish>,
    private readonly usersService: UsersService,
  ) {}

  findOne(query: FindOneOptions<Wish>) {
    return this.wishesRepository.findOneOrFail(query);
  }

  // + Добавить подарок
  async create(createWishDto: CreateWishDto, userId: number): Promise<Wish> {
    const userOwner = await this.usersService.findById(userId);
    console.log(userId, userOwner);
    const wish = await this.wishesRepository.create({
      ...createWishDto,
      owner: userOwner,
    });

    return this.wishesRepository.save(wish);
  }

  async getLastWishes() {
    const lastWishes = await this.wishesRepository.find({
      take: 40,
      order: {
        createdAt: 'DESC',
      },
      relations: ['owner', 'offers'],
    });
    return lastWishes;
  }

  async getTopWishes() {
    const topWishes = await this.wishesRepository.find({
      take: 20,
      order: {
        copied: 'DESC',
      },
      relations: ['owner', 'offers'],
    });
    return topWishes;
  }

  // + Найти подарок по его id
  async getWishByWishId(wishId: number) {
    return await this.wishesRepository.findOne({
      where: { id: wishId }, // желание будет искаться по его айди
      // через слова-связки подтягиваю "владельца" желания (все его поля)
      // и тех, кто предложил скинуться на подарок
      relations: ['owner', 'offers'],
    });
  }

  // + Редактировать желание
  async updateWish(
    wishId: number,
    updateWishDto: UpdateWishDto,
    userId: number,
  ): Promise<Wish> {
    const wish = await this.wishesRepository.findOne({
      where: {
        id: wishId,
      },
      relations: ['owner'],
    });

    if (!wish || !wish.owner) {
      throw new NotFoundException('Requested wish or its owner was not found');
    }
    if (userId !== wish.owner.id) {
      throw new ForbiddenException(
        'You have no permission to update a wish that was created by another user',
      );
    }
    if (wish.raised > 0) {
      throw new ForbiddenException(
        'Price cannot be changed as someone has already supported this wish',
      );
    }

    const updatedWish = this.wishesRepository.save({
      ...wish,
      ...updateWishDto,
    });

    return updatedWish;
  }

  // + Удалить желание
  async deleteWish(wishId: number, userId: number): Promise<Wish> {
    const wish = await this.wishesRepository.findOne({
      where: {
        id: wishId,
      },
      relations: ['owner', 'offers', 'wishlists'],
    });

    if (!wish) {
      throw new NotFoundException('Requested wish was not found');
    }
    if (wish.owner.id !== userId) {
      throw new ForbiddenException(
        'You cannot delete this wish because it was created by another user',
      );
    }

    return this.wishesRepository.remove(wish);
  }

  // + Скопировать к себе желание
  async copy(wishId: number, userId: number) {
    const wish = await this.wishesRepository.findOneOrFail({
      where: { id: wishId },
    });

    const alreadyCopied = await this.wishesRepository.createQueryBuilder('wish')
    .leftJoin('wish.owner', 'owner')
    .where('wish.id = :wishId', { wishId })
    .andWhere('owner.id = :userId', { userId })
    .getCount();

    if (alreadyCopied > 0) {
      throw new ConflictException('You have already copied this wish');
    }

    const createWishDto: CreateWishDto = {
      name: wish.name,
      link: wish.link,
      image: wish.image,
      price: wish.price,
      description: wish.description,
    };

    wish.copied++;
    this.wishesRepository.save(wish);

    return this.create(createWishDto, userId);
  }

  async updateWishWithOffer(id: number, amount: number) {
    return await this.wishesRepository.update({ id }, { raised: amount });
  }

  // Вернуть желания по их id
  async getWishesArrayByWishesId(ids: number[]) {
    const wishesArray = [];

    for (const id of ids) {
      wishesArray.push(await this.getWishByWishId(id));
    }
    return wishesArray;
  }

  // Вернуть список желаний
  async getWishesList(item): Promise<Wish[]> {
    return await this.wishesRepository.findBy(item);
  }
}
