import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { DataNotFoundException } from 'src/errors/exceptions/data-not-found.exception';
import { FindAllUsersDto } from './dto/find-all-users.dto';
import { UtilsService } from 'src/utils/utils.service';
import { AuthorityEnum } from './enums/authority.enum';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @Inject(UtilsService) private readonly utilsService: UtilsService,
  ) {}

  async createOne(createUserDto: CreateUserDto): Promise<void> {
    const user = new User();
    user.email = createUserDto.email;
    user.name = createUserDto.name;
    user.nickname = createUserDto.nickname;
    user.authority = [AuthorityEnum.NORMAL];
    const password = this.authService.createPassword(createUserDto.password);
    user.pubkey = password.pubkey;
    user.keysalt = password.salt;

    try {
      await this.usersRepository.save(user);
    } catch (err) {
      this.logger.debug(err);
      throw err;
    }
  }

  async createMany(createUserDtos: CreateUserDto[]): Promise<void> {
    for (const createUserDto of createUserDtos) {
      await this.createOne(createUserDto);
    }
  }

  async findAll(findAllUsersDto: FindAllUsersDto): Promise<User[]> {
    const users = await this.usersRepository.find(
      this.utilsService.queryNullableFilter({
        where: findAllUsersDto.query,
        skip:
          findAllUsersDto.pagination.count * findAllUsersDto.pagination.page,
        take: findAllUsersDto.pagination.count,
        order: findAllUsersDto.order,
      }),
    );

    if (!users || users.length === 0) {
      throw new DataNotFoundException({ name: 'users' });
    }
    return users;
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new DataNotFoundException({ name: 'user' });
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ email });
    if (!user) {
      throw new DataNotFoundException({ name: 'user' });
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.update({ id }, updateUserDto);
    if (!user) {
      throw new DataNotFoundException({ name: 'user' });
    }
  }

  async remove(id: string): Promise<void> {
    const user = await this.usersRepository.softRemove({ id });
    if (!user) {
      throw new DataNotFoundException({ name: 'user' });
    }
  }
}
