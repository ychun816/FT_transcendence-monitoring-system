import {
  AfterLoad,
  BeforeInsert,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuthorityEnum } from './enums/authority.enum';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @BeforeInsert()
  private beforeInsert() {
    this.authority = JSON.stringify(
      this.authority,
    ) as unknown as AuthorityEnum[];
  }

  @AfterLoad()
  private afterLoad() {
    this.authority = JSON.parse(
      this.authority as unknown as string,
    ) as AuthorityEnum[];
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', unique: true })
  nickname: string;

  @Column('text')
  authority: AuthorityEnum[];

  @Exclude()
  @Column({ type: 'text' })
  pubkey: string;

  @Exclude()
  @Column({ type: 'text' })
  keysalt: string;
}
