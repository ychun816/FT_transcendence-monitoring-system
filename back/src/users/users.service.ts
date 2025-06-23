import { Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DataSource, Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('Users.Service');

  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async createOne(createUserDto: CreateUserDto): Promise<void> {
    const user = new User();
    user.email = createUserDto.email;
    user.name = createUserDto.name;
    // TODO : password
    try {
      await this.usersRepository.save(user);
    } catch (err) {
      this.logger.debug(err);
      throw err;
    }
  }

  async createMany(createUserDtos: CreateUserDto[]): Promise<void> {
    // const queryRunner = this.dataSource.createQueryRunner();
    // await queryRunner.connect();
    // await queryRunner.startTransaction();
    // try {
    //   for (const user of createUserDtos) {
    //     await queryRunner.manager.save(user);
    //   }
    // } catch (err: unknown) {
    //   this.logger.debug(err);
    //   await queryRunner.rollbackTransaction();
    // } finally {
    //   await queryRunner.release();
    // }
  }

  async findAll(): Promise<User[]> {
    return [];
  }

  async findOne(id: number): Promise<User> {
    // return `This action returns a #${id} user`;
    return (await this.usersRepository.findOne({
      where: { id },
    })) as any;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // return `This action updates a #${id} user`;
  }

  async remove(id: number): Promise<void> {
    // return `This action removes a #${id} user`;
  }
}
