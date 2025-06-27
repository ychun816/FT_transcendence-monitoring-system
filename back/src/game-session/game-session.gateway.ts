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
import { Logger, UseFilters, UsePipes } from '@nestjs/common';
import { Socket } from 'socket.io';
import { RegisterQueueDto } from './dto/register-queue.dto';
import { WsExceptionFilter } from 'src/filters/ws-exception.filter';
import { WsValidationPipe } from 'src/pipe/ws-validation.pipe';

@UseFilters(WsExceptionFilter)
@UsePipes(new WsValidationPipe())
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameSessionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly gameSessionService: GameSessionService) {}

  private readonly logger = new Logger(GameSessionGateway.name);

  async handleConnection(@ConnectedSocket() client: Socket) {
    await this.gameSessionService.handleConnection(client);
  }

  handleDisconnect(client: Socket) {
    this.gameSessionService.handleDisconnect(client);
  }

  @SubscribeMessage('registerQueue')
  registerQueue(
    @ConnectedSocket() client: Socket,
    @MessageBody() registerQueueDto: RegisterQueueDto,
  ) {
    this.gameSessionService.registerQueue(client, registerQueueDto);
  }

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
