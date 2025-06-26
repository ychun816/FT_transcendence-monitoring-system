import { Module } from '@nestjs/common';
import { GameSessionService } from './game-session.service';
import { GameSessionGateway } from './game-session.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [AuthModule, UsersModule],
  providers: [GameSessionGateway, GameSessionService],
  exports: [GameSessionService],
})
export class GameSessionModule {}
