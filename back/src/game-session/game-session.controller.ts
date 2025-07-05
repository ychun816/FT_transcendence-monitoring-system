import { Controller, Get, Inject } from '@nestjs/common';
import { GameSessionService } from './game-session.service';

@Controller('game-session')
export class GameSessionController {
  constructor(private readonly gameSessionService: GameSessionService) {}

  @Get('queue-info')
  getQueueInfo() {
    const queue = this.gameSessionService.getSeperatedUserQueue();
    return {
      PONG: queue.PONG.length,
      SHOOT: queue.SHOOT.length,
    };
  }
}
