import { User } from 'src/users/user.entity';

export interface PongData {
  ball: {
    x: number;
    y: number;
  };
  player1: {
    user: User;
    score: number;
    y: number;
  };
  player2: {
    user: User;
    score: number;
    y: number;
  };
  lobbyData: {
    [key: string]: {
      color: string;
      map: string;
      ready: boolean;
    };
  };
  mapVoteData: string[];
}
