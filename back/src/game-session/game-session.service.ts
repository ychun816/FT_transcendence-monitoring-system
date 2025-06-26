import { Injectable } from '@nestjs/common';
import { CreateGameSessionDto } from './dto/create-game-session.dto';
import { UpdateGameSessionDto } from './dto/update-game-session.dto';
import { UserQueue } from './entities/user-queue.entity';
import { Socket } from 'socket.io';

@Injectable()
export class GameSessionService {
  readonly userQueue: UserQueue[] = [];

  handleHandshake(client: Socket) {}

  create(createGameSessionDto: CreateGameSessionDto) {
    return 'This action adds a new gameSession';
  }

  findAll() {
    return `This action returns all gameSession`;
  }

  findOne(id: number) {
    return `This action returns a #${id} gameSession`;
  }

  update(id: number, updateGameSessionDto: UpdateGameSessionDto) {
    return `This action updates a #${id} gameSession`;
  }

  remove(id: number) {
    return `This action removes a #${id} gameSession`;
  }
}
