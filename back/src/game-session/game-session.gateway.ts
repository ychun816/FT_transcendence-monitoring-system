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
import { GameConfigDto } from './dto/game-config.dto';
import { GamedataPongDto } from './dto/gamedata-pong.dto';
import { GamedataShootDto } from './dto/gamedata-shoot.dto';

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

  @SubscribeMessage('readyUser')
  readyUser(@ConnectedSocket() client: Socket) {
    this.gameSessionService.readyUser(client);
  }

  @SubscribeMessage('cancelReadyUser')
  cancelReadyUser(@ConnectedSocket() client: Socket) {
    this.gameSessionService.cancelReadyUser(client);
  }

  @SubscribeMessage('gameConfig')
  gameConfig(
    @ConnectedSocket() client: Socket,
    @MessageBody() gameConfigDto: GameConfigDto,
  ) {
    this.gameSessionService.gameConfig(client, gameConfigDto);
  }

  @SubscribeMessage('gamedata-pong')
  gamedataPong(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: GamedataPongDto,
  ) {
    this.gameSessionService.gamedataPong(client, data);
  }

  @SubscribeMessage('gamedata-shoot')
  gamedataShoot(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: GamedataShootDto,
  ) {
    this.gameSessionService.gamedataShoot(client, data);
  }
}
