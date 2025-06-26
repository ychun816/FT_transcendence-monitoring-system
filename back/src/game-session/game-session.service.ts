import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateGameSessionDto } from './dto/create-game-session.dto';
import { UpdateGameSessionDto } from './dto/update-game-session.dto';
import { UserQueue } from './entities/user-queue.entity';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { WsException } from '@nestjs/websockets';
import { JwtTokenInvalidException } from 'src/errors/exceptions/jwt-token-invalid.exception';
import { TokenType } from 'src/auth/enum/token-type.enum';
import { User } from 'src/users/user.entity';
import { HttpExceptionFactory } from 'src/errors/http-exception-factory.class';
import { RegisterQueueDto } from './dto/register-queue.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class GameSessionService {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {}
  readonly userQueue: UserQueue[] = [];
  private readonly logger = new Logger(GameSessionService.name);

  async handleConnection(client: Socket) {
    try {
      const token = (client.handshake.auth.Authorization ||
        client.handshake.auth.token) as unknown;
      if (!token || typeof token !== 'string') {
        throw new JwtTokenInvalidException();
      }
      const tokenValue = this.authService.verifyToken<User>(
        token,
        TokenType.ACCESS,
      );

      const user = await this.usersService.findOne(tokenValue.id);

      this.logger.debug(`User connected : ${user.id} - ${user.email}`);

      client.handshake.auth.user = user;
    } catch (error: unknown) {
      if (error instanceof HttpExceptionFactory) {
        client.send(error.errorDetails.code);
        client.disconnect();
        return;
      } else {
        client.send('UNKNOWN_ERROR');
        client.disconnect();
        return;
      }
    }
  }

  handleDisconnect(client: Socket) {}

  registerQueue(client: Socket, registerQueueDto: RegisterQueueDto) {
    const user = client.handshake.auth.user as User;

    for (const userQueue of this.userQueue) {
      if (userQueue.user.id === user.id) {
        throw new WsException('You are already registered in the queue');
      }
    }

    const newUserQueue: UserQueue = {
      entryTimestamp: new Date(Date.now()),
      user: user,
      gametype: registerQueueDto.gametype,
    };

    this.userQueue.push(newUserQueue);
    client.emit('registerQueue', true);
  }

  unregisterQueue(client: Socket) {
    const user = client.handshake.auth.user as User;

    const index = this.userQueue.findIndex(
      (userQueue) => userQueue.user.id === user.id,
    );

    if (index === -1) {
      throw new WsException('You are not registered in the queue');
    }

    this.userQueue.splice(index, 1);
  }

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
