import { Test, TestingModule } from '@nestjs/testing';
import { GameSessionGateway } from './game-session.gateway';
import { GameSessionService } from './game-session.service';

describe('GameSessionGateway', () => {
  let gateway: GameSessionGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameSessionGateway, GameSessionService],
    }).compile();

    gateway = module.get<GameSessionGateway>(GameSessionGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
