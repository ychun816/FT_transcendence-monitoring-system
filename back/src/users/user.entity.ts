import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AuthorityEnum } from './enums/authority.enum';

@Entity()
export class User {
  @IsNotEmpty()
  @PrimaryGeneratedColumn()
  id: number;

  @IsEmail()
  @IsNotEmpty()
  @Column({ unique: true })
  email: string;

  @IsString()
  @IsNotEmpty()
  @Column({ type: 'text' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @Column({ type: 'text', unique: true })
  nickname: string;

  @IsEnum(AuthorityEnum, { each: true })
  @Column({ type: 'text', enum: AuthorityEnum })
  authority: AuthorityEnum[];

  @IsNotEmpty()
  @IsString()
  @Column({ type: 'text' })
  pubkey: string;

  @IsString()
  @IsNotEmpty()
  @Column({ type: 'text' })
  keysalt: string;
}
