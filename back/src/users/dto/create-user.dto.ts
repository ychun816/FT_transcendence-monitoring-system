import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  IsArray,
  IsEnum,
} from 'class-validator';
import { AuthorityEnum } from '../enums/authority.enum';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsStrongPassword()
  password: string;

  @IsString()
  @IsNotEmpty()
  nickname: string;
}
