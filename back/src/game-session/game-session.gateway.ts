import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { GameSessionService } from './game-session.service';
import { CreateGameSessionDto } from './dto/create-game-session.dto';
import { UpdateGameSessionDto } from './dto/update-game-session.dto';

@WebSocketGateway()
export class GameSessionGateway {
  constructor(private readonly gameSessionService: GameSessionService) {}

  @SubscribeMessage('createGameSession')
  create(@MessageBody() createGameSessionDto: CreateGameSessionDto) {
    return this.gameSessionService.create(createGameSessionDto);
  }

  @SubscribeMessage('findAllGameSession')
  findAll() {
    return this.gameSessionService.findAll();
  }

  @SubscribeMessage('findOneGameSession')
  findOne(@MessageBody() id: number) {
    return this.gameSessionService.findOne(id);
  }

  @SubscribeMessage('updateGameSession')
  update(@MessageBody() updateGameSessionDto: UpdateGameSessionDto) {
    return this.gameSessionService.update(
      updateGameSessionDto.id,
      updateGameSessionDto,
    );
  }

  @SubscribeMessage('removeGameSession')
  remove(@MessageBody() id: number) {
    return this.gameSessionService.remove(id);
  }
}
