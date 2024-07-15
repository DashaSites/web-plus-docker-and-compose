import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { WishesService } from 'src/wishes/wishes.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { User } from 'src/users/entities/user.entity';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistsRepository: Repository<Wishlist>,
    private readonly wishesService: WishesService,
  ) {}

  // + Создать вишлист
  async create(createWishlistDto: CreateWishlistDto, user: User): Promise<Wishlist> {
    const { itemsId } = createWishlistDto;
    const myWishes = await this.wishesService.getWishesArrayByWishesId(itemsId);
    console.log(myWishes);

    if (myWishes?.length === 0) {
      throw new ForbiddenException('A wishlist has to contain wishes in order to be created');
    }

    const myWishlist = await this.wishlistsRepository.save({
      ...createWishlistDto,
      items: myWishes,
      owner: user,
    });

    return myWishlist;
  } 

  // + Найти все вишлисты
  async getAllWishlists(): Promise<Wishlist[]> {
    const wishlists = await this.wishlistsRepository.find({
      relations: ['items', 'owner']
    });
    return wishlists;
  }

  // + Найти вишлист по id
  async getWishlistById(id: number): Promise<Wishlist> {
    const wishlist = await this.wishlistsRepository.findOne({
      where: {
        id: id,
      },
      relations: ['items', 'owner']
    });
    if (!wishlist) {
      throw new NotFoundException('Requested wishlist was not found');
    }
    return wishlist;
  }

  // + Отредактировать вишлист, найденный по id
  async editWishlist(id: number, updateWishlistDto: UpdateWishlistDto, userId: number): Promise<Wishlist> {
    const wishlist = await this.wishlistsRepository.findOne({
      where: {
        id: id,
      },
      relations: ['items', 'owner']
    });
    if (!wishlist) {
      throw new NotFoundException('Requested wishlist was not found');
    }
    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException('Requested wishlist was created by another user and cannot be edited');
    }
    
    // вытаскиваю обновленный список желаний
    const relevantWishes = await this.wishesService.getWishesList(updateWishlistDto.itemsId);

    const editedWishList = await this.wishlistsRepository.save({
      ...wishlist,
      name: updateWishlistDto.name,
      description: updateWishlistDto.description,
      image: updateWishlistDto.image,
      items: relevantWishes,
    });

    return editedWishList;
  }

  // + Удалить репозиторий по id
  async deleteWishlist(wishlistId: number, userId: number): Promise<Wishlist> {
    const wishlist = await this.getWishlistById(wishlistId);

    if (!wishlist) {
      throw new NotFoundException('Requested wishlist was not found');
    }
    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException('Requested wishlist was created by another user and cannot be deleted');
    }
    return await this.wishlistsRepository.remove(wishlist);
  }
}
