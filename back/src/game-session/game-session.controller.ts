import { Controller, Get } from '@nestjs/common';

@Controller('game-session')
export class GameSessionController {
  @Get('queue-info')
  getQueueInfo() {}
}
