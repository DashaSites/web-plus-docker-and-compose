import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UsersService } from 'src/users/users.service';
import { WishesService } from 'src/wishes/wishes.service';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offersRepository: Repository<Offer>,
    private readonly usersService: UsersService,
    private readonly wishesService: WishesService,
  ) {}

  // + Скинуться на подарок
  async createOffer(createOfferDto: CreateOfferDto, userId: number) {
    const { amount, itemId } = createOfferDto;

    // достаю пользователя, который хочет сделать оффер
    const offerGiver = await this.usersService.findOne({
      where: {
        id: userId,
      },
      relations: ['offers'],
    });

    // достаю wish из тела запроса
    const wish = await this.wishesService.findOne({
      where: {
        id: itemId,
      },
      relations: ['owner', 'offers'],
    });

    if (!wish) {
      throw new NotFoundException('Requested wish was not found');
    }
    if (wish.owner.id === userId) {
      throw new ForbiddenException('An offer for your own wish cannot be submitted');
    }
    if (amount > wish.price) {
      throw new ForbiddenException('Your offer cannot exceed the price of the wish');
    }
    if (amount > Number(wish.price) - Number(wish.raised)) {
      throw new ForbiddenException(
        'You cannot offer more than the sum that needs to be raised',
      );
    }
    if (wish.price === wish.raised) {
      throw new ForbiddenException('The required sum has already been raised, thank you');
    }

    // обновляю поле raised у подарка
    await this.wishesService.updateWishWithOffer(
      wish.id,
      Number(amount) + Number(wish.raised),
    );

    return await this.offersRepository.save({
      ...createOfferDto,
      user: offerGiver,
      item: wish,
    });
  }

  // + Все офферы
  async getAllOffers(): Promise<Offer[]> {
    const offers = await this.offersRepository.find({
      relations: ['user'],
    });
    return offers;
  }

  // + Найти оффер по id
  async findOfferById(offerId: number): Promise<Offer> {
    const offer = this.offersRepository.findOne({
      where: { id: offerId },
      relations: ['user', 'item'],
    });
    if (!offer) {
      throw new NotFoundException('Requested offer was not found');
    }

    return offer;
  }
}
