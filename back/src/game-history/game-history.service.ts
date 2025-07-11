import { Injectable, Logger } from '@nestjs/common';
import { CreateGameHistoryDto } from './dto/create-game-history.dto';
import { UpdateGameHistoryDto } from './dto/update-game-history.dto';
import { GameHistory } from './entities/game-history.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetMyGameHistoryDto } from './dto/get-my-game-history.dto';
import { GetAllGameHistoryDto } from './dto/get-all-game-history.dto';
import { DataNotFoundException } from 'src/errors/exceptions/data-not-found.exception';

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

    gameHistory.gametype = createGameHistoryDto.gametype;
    gameHistory.players = createGameHistoryDto.players;
    gameHistory.winner = createGameHistoryDto.winner;

    try {
      await this.gameHistoryRepository.save(gameHistory);

      return gameHistory;
    } catch (err) {
      this.logger.debug(err);
      throw err;
    }
  }

  async findMyAll(
    query: GetMyGameHistoryDto,
    user: string,
  ): Promise<GameHistory[]> {
    return this.gameHistoryRepository.find({
      where: { players: user },
      order: query.sort ? { [query.sort.field]: query.sort.order } : undefined,
      skip: query.pagination
        ? (query.pagination?.count || 0) * (query.pagination.page || 0)
        : undefined,
      take: query.pagination?.count || undefined,
    });
  }

  findAll(query: GetAllGameHistoryDto): Promise<GameHistory[]> {
    return this.gameHistoryRepository.find({
      where: query.query, // TODO
      order: query.sort ? { [query.sort.field]: query.sort.order } : undefined,
      skip: query.pagination
        ? (query.pagination?.count || 0) * (query.pagination.page || 0)
        : undefined,
      take: query.pagination?.count || undefined,
    });
  }

  async findById(id: string): Promise<GameHistory> {
    const gameHistory = await this.gameHistoryRepository.findOne({
      where: { id },
    });
    if (!gameHistory) {
      throw new DataNotFoundException({ name: 'game history' });
    }
    return gameHistory;
  }

  update(id: number, updateGameHistoryDto: UpdateGameHistoryDto) {
    return `This action updates a #${id} gameHistory`;
  }

  remove(id: number) {
    return `This action removes a #${id} gameHistory`;
  }
}
