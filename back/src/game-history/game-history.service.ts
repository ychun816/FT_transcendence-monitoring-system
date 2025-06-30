import { Injectable } from '@nestjs/common';
import { CreateGameHistoryDto } from './dto/create-game-history.dto';
import { UpdateGameHistoryDto } from './dto/update-game-history.dto';

@Injectable()
export class GameHistoryService {
  create(createGameHistoryDto: CreateGameHistoryDto) {
    return 'This action adds a new gameHistory';
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
