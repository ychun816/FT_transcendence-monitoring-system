import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AuthorityEnum } from './enums/authority.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @IsNotEmpty()
  id: number;

  @Column({ unique: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Column({ type: 'string', unique: true })
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @Column({ type: 'array', enum: AuthorityEnum })
  @IsEnum(AuthorityEnum, { each: true })
  authority: AuthorityEnum[];

  @Column({ type: 'string' })
  @IsNotEmpty()
  @IsString()
  pubkey: string;

  @Column({ type: 'string' })
  @IsString()
  @IsNotEmpty()
  keysalt: string;
}
