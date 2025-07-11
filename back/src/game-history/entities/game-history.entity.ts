import { GametypeEnum } from 'src/game-session/enum/game-type.enum';
import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class GameHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: false })
  gametype: GametypeEnum;

  @Column({ type: 'number', default: () => Date.now() })
  date: number;

  @Column({
    type: 'text',
    transformer: {
      from: (value: string) => JSON.parse(value) as string[],
      to: (value: string[]) => JSON.stringify(value),
    },
  })
  players: string[];

  @Column({ type: 'text' })
  winner: string;
}
