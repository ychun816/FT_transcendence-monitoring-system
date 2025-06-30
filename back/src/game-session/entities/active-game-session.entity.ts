import { IngameStatus } from '../enum/ingame-status.enum';
import { UserQueue } from './user-queue.entity';

export class ActiveGameSession<TData> {
  id: string;
  gametype: string;
  status: IngameStatus;
  players: UserQueue[];
  data: TData;
}
