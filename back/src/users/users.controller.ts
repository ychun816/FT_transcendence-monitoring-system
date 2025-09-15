import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindAllUsersDto } from './dto/find-all-users.dto';
import { Roles } from '../decorators/roles.decorator';
import { AuthorityEnum } from './enums/authority.enum';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { Throttle } from '@nestjs/throttler';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 300 } })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createOne(createUserDto);
  }

  @Post('bulk')
  @Roles(AuthorityEnum.ADMIN)
  createMany(@Body() createUserDtos: CreateUserDto[]) {
    return this.usersService.createMany(createUserDtos);
  }

  @Get()
  @Roles(AuthorityEnum.NORMAL)
  findAll(@Query() findAllUsersDto: FindAllUsersDto) {
    return this.usersService.findAll(findAllUsersDto);
  }

  @Get(':id')
  @Roles(AuthorityEnum.NORMAL)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(AuthorityEnum.ADMIN)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch('me')
  @Roles(AuthorityEnum.NORMAL)
  updateMe(
    @Req() request: RequestWithUser,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(request.user.id, updateUserDto);
  }

  @Delete(':id')
  @Roles(AuthorityEnum.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Delete('me')
  @Roles(AuthorityEnum.NORMAL)
  removeMe(@Req() request: RequestWithUser) {
    return this.usersService.remove(request.user.id);
  }
}
