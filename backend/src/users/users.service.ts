import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { FindOneOptions, ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { encrypt } from 'src/helpers/password-helpers.helper';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Wish } from 'src/wishes/entities/wish.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  // + Нахожу всех пользователей
  getAllUsers(): Promise<User[]> {
    return this.usersRepository.find({});
  }

  // + Регистрация
  async signup(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password } = createUserDto;

    const userWithExistingEmail = await this.usersRepository.findOne({
      where: { email },
    });
    const userWithExistingUsername = await this.usersRepository.findOne({
      where: { username },
    });

    if (userWithExistingEmail && userWithExistingUsername) {
      throw new ConflictException('This email and this username already belong to someone else');
    }
    if (userWithExistingEmail) {
      throw new ConflictException('User with this email already exists');
    }

    if (userWithExistingUsername) {
      throw new ConflictException('User with this username already exists');
    }

    const user = await this.usersRepository.create({
      ...createUserDto,
      password: await encrypt(password),
    });
    return this.usersRepository.save(user);
  }

  // + Этот метод используется в методе авторизации в JwtStrategy
  // (он полностью возвращает объект пользователя)
  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    return user;
  }

  // + Метод нахождения пользователя: используется в методе контроллера findOwn
  // FindOneOptions - это специальный тип, который возвращает объект, соответствующий
  // структуре с where и select из запроса
  findOne(query: FindOneOptions<User>) {
    return this.usersRepository.findOneOrFail(query);
  }

  async getUserByUsername(username: string): Promise<User> {
    const user = this.findOne({
      where: { username: ILike(username) },
      select: {
        id: true,
        username: true,
        about: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException('Requested user was not found');
    }
    return user;
  }

  // + Редактирование профайла пользователя
  async updateMyProfile(id: number, updateUserDto: UpdateUserDto) {
    const { password, email, username } = updateUserDto;

    const user = await this.findById(id);

    if (email && email !== user.email) {
      const userWithExistingEmail = await this.usersRepository.findOne({ 
        where: { email } 
      });
      if (userWithExistingEmail) {
        throw new ConflictException('Email is already taken');
      }
    }
    if (username && username !== user.username) {
      const userWithExistingUsername = await this.usersRepository.findOne({ 
        where: { username } 
      });
      if (userWithExistingUsername) {
        throw new ConflictException('Username is already taken');
      }
    }

    if (password) {
      updateUserDto.password = await encrypt(password);
    }

    return this.usersRepository.save({ ...user, ...updateUserDto });
  }

  // + Найти все желания авторизованного пользователя
  async getMyWishes(userId: number): Promise<Wish[]> {
    const currentUser = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['wishes'],
    });
    if (currentUser && (!currentUser.wishes)) {
      throw new NotFoundException('No wishes were added so far');
    }
    return currentUser.wishes;
  }

  // + Найти все желания пользователя c таким-то именем
  async getUserWishesByUsername(username: string): Promise<Wish[]> {
    const user = await this.findOne({
      where: { username: ILike(username) },
      relations: ['wishes'],
    });

    if (!user) {
      throw new NotFoundException('Requested user was not found');
    }

    return user.wishes;
  }

  // + Поиск многих пользователей по username или email
  async findMany(query: string): Promise<User[]> {
    const users = await this.usersRepository.find({
      where: [{ username: ILike(query) }, { email: ILike(query) }],
    });

    if (!users) {
      throw new NotFoundException('No users were found');
    }
    return users;
  }
}
