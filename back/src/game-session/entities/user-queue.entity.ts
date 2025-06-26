import { User } from 'src/users/user.entity';
import { GametypeEnum } from '../enum/game-type.enum';

export interface UserQueue {
  user: User;
  gametype: GametypeEnum;
  entryTimestamp: Date;
}
