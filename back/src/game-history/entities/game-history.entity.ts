import { GametypeEnum } from 'src/game-session/enum/game-type.enum';
import { User } from 'src/users/user.entity';
import {
  AfterLoad,
  BeforeInsert,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';

export class GameHistory {
  @BeforeInsert()
  private beforeInsert() {
    this.players = JSON.stringify(this.players) as unknown as User[];
    this.result = JSON.stringify(this.result) as unknown as User[];
  }

  @AfterLoad()
  private afterLoad() {
    this.players = JSON.parse(this.players as unknown as string) as User[];
    this.result = JSON.parse(this.result as unknown as string) as User[];
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'number', default: () => Date.now() })
  startDate: number;

  @Column({ type: 'text', nullable: false })
  gametype: GametypeEnum;

  @Column({ type: 'number' })
  endDate: number;

  @Column({ type: 'text' })
  players: User[];

  @Column({ type: 'text' })
  result: User[];
}
