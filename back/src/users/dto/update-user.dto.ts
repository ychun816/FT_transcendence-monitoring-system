import { IsOptional, IsString, IsStrongPassword } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsStrongPassword()
  password?: string;
}
