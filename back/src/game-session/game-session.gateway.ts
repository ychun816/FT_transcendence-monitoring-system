import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { GameSessionService } from './game-session.service';
import { Logger, UseFilters, UsePipes } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RegisterQueueDto } from './dto/register-queue.dto';
import { WsExceptionFilter } from 'src/filters/ws-exception.filter';
import { WsValidationPipe } from 'src/pipe/ws-validation.pipe';
import { ParseJsonPipe } from 'src/pipe/parse-json.pipe';

@UseFilters(WsExceptionFilter)
@UsePipes(new ParseJsonPipe(), new WsValidationPipe())
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameSessionGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(private readonly gameSessionService: GameSessionService) {}

  private readonly logger = new Logger(GameSessionGateway.name);

  async handleConnection(@ConnectedSocket() client: Socket) {
    await this.gameSessionService.handleConnection(client);
  }

  afterInit(server: Server) {
    this.gameSessionService.server = server;
    this.logger.debug('WebSocket server initialized');
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

  @SubscribeMessage('unregisterQueue')
  unregisterQueue(@ConnectedSocket() client: Socket) {
    this.gameSessionService.unregisterQueue(client);
  }

  @SubscribeMessage('enterGame')
  enterGame(@ConnectedSocket() client: Socket) {}

  // @SubscribeMessage('createGameSession')
  // create(
  //   @MessageBody()
  //   createGameSessionDto: CreateGameSessionDto,
  // ) {
  //   return this.gameSessionService.create(createGameSessionDto);
  // }

  // @SubscribeMessage('findAllGameSession')
  // findAll() {
  //   return this.gameSessionService.findAll();
  // }

  // @SubscribeMessage('findOneGameSession')
  // findOne(@MessageBody() id: number) {
  //   return this.gameSessionService.findOne(id);
  // }

  // @SubscribeMessage('updateGameSession')
  // update(@MessageBody() updateGameSessionDto: UpdateGameSessionDto) {
  //   return this.gameSessionService.update(
  //     updateGameSessionDto.id,
  //     updateGameSessionDto,
  //   );
  // }

  // @SubscribeMessage('removeGameSession')
  // remove(@MessageBody() id: number) {
  //   return this.gameSessionService.remove(id);
  // }
}
