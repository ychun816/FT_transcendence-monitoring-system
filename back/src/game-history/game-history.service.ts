import { Injectable, Logger } from '@nestjs/common';
import { CreateGameHistoryDto } from './dto/create-game-history.dto';
import { UpdateGameHistoryDto } from './dto/update-game-history.dto';
import { GameHistory } from './entities/game-history.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class GameHistoryService {
  constructor(
    @InjectRepository(GameHistory)
    private readonly gameHistoryRepository: Repository<GameHistory>,
  ) {}

  private readonly logger = new Logger(GameHistoryService.name);

  async create(
    createGameHistoryDto: CreateGameHistoryDto,
  ): Promise<GameHistory> {
    const gameHistory = new GameHistory();

    try {
      await this.gameHistoryRepository.save(gameHistory);

      return gameHistory;
    } catch (err) {
      this.logger.debug(err);
      throw err;
    }
  }

  findAll() {
    return `This action returns all gameHistory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} gameHistory`;
  }

  update(id: number, updateGameHistoryDto: UpdateGameHistoryDto) {
    return `This action updates a #${id} gameHistory`;
  }

  remove(id: number) {
    return `This action removes a #${id} gameHistory`;
  }
}
