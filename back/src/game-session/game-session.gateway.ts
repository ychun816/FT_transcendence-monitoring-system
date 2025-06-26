import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { GameSessionService } from './game-session.service';
import { CreateGameSessionDto } from './dto/create-game-session.dto';
import { UpdateGameSessionDto } from './dto/update-game-session.dto';
import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';

@WebSocketGateway()
export class GameSessionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly gameSessionService: GameSessionService) {}

  private readonly logger = new Logger(GameSessionGateway.name);

  handleConnection(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: string,
  ) {
    this.gameSessionService.handleHandshake(client);
  }

  handleDisconnect(client: any) {}

  @SubscribeMessage('registerQueue')
  registerQueue(@MessageBody() registeQueueDto) {}

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
