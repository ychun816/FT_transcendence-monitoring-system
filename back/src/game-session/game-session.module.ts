import { Module } from '@nestjs/common';
import { GameSessionService } from './game-session.service';
import { GameSessionGateway } from './game-session.gateway';

@Module({
  providers: [GameSessionGateway, GameSessionService],
})
export class GameSessionModule {}
