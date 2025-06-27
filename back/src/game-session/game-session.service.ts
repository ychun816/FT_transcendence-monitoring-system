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
import { RegisterQueueStatus } from './enum/register-queue-status.enum';
import { GametypeEnum } from './enum/game-type.enum';
import ms from 'ms';

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

  handleDisconnect(client: Socket) {
    const user = client.handshake.auth.user as User;

    this.logger.debug(`User disconnected : ${user.id} - ${user.email}`);

    // Unregister the user if they disconnect
    const index = this.userQueue.findIndex(
      (userQueue) => userQueue.user.id === user.id,
    );

    if (index !== -1) {
      this.userQueue.splice(index, 1);
    }
  }

  registerQueue(client: Socket, registerQueueDto: RegisterQueueDto) {
    const user = client.handshake.auth.user as User;

    console.log(registerQueueDto, registerQueueDto.gametype);

    for (const userQueue of this.userQueue) {
      if (userQueue.user.id === user.id) {
        client.emit('registerQueue', RegisterQueueStatus.ALREADY_REGISTERED);
        return;
      }
    }

    const newUserQueue: UserQueue = {
      entryTimestamp: new Date(Date.now()),
      user: user,
      gametype: registerQueueDto.gametype,
    };

    console.log(newUserQueue, registerQueueDto.gametype);

    this.userQueue.push(newUserQueue);
    client.emit('registerQueue', RegisterQueueStatus.REGISTERED);
  }

  unregisterQueue(client: Socket) {
    const user = client.handshake.auth.user as User;

    const index = this.userQueue.findIndex(
      (userQueue) => userQueue.user.id === user.id,
    );

    if (index === -1) {
      client.emit('registerQueue', RegisterQueueStatus.NOT_REGISTERED);
      return;
    }

    this.userQueue.splice(index, 1);

    client.emit('registerQueue', RegisterQueueStatus.UNREGISTERED);
  }

  private handleGameQueueEntry(
    userQueue: [UserQueue, ...UserQueue[]],
    gametype: GametypeEnum,
  ) {
    const timeDiffMs =
      Date.now() - userQueue[0].entryTimestamp.getUTCMilliseconds();
    if (timeDiffMs > ms('60s')) {
      // If user waiting >= 2 , create room
    } else if (timeDiffMs > ms('30s') && userQueue.length >= 4) {
      // If user waiting >= 4 , create room
    } else if (timeDiffMs > ms('20s') && userQueue.length >= 8) {
      // If user waiting >= 8 , create room
    } else {
      this.logger.debug(
        `Game : ${gametype} - Not enough players. Waiting time: ${ms(timeDiffMs)}`,
      );
    }
  }

  handleGameQueue() {
    this.logger.debug('Handling game queue...');
    const queue: {
      [GametypeEnum.PONG]: UserQueue[];
      [GametypeEnum.SHOOT]: UserQueue[];
    } = {
      [GametypeEnum.PONG]: [],
      [GametypeEnum.SHOOT]: [],
    };

    this.userQueue.forEach((userQueue) => {
      // console.log(userQueue, this.userQueue);
      if (userQueue.gametype === GametypeEnum.PONG) {
        queue[GametypeEnum.PONG].push(userQueue);
      } else {
        queue[GametypeEnum.SHOOT].push(userQueue);
      }
    });
    // console.log(queue);
    this.logger.debug(
      `Current queue status - PONG : ${queue[GametypeEnum.PONG].length}, SHOOT : ${queue[GametypeEnum.SHOOT].length}`,
    );

    if (queue[GametypeEnum.PONG].length >= 2) {
      this.handleGameQueueEntry(
        queue[GametypeEnum.PONG] as [UserQueue, ...UserQueue[]], // len >= 2
        GametypeEnum.PONG,
      );
    }

    if (queue[GametypeEnum.SHOOT].length >= 2) {
      this.handleGameQueueEntry(
        queue[GametypeEnum.SHOOT] as [UserQueue, ...UserQueue[]], // len >= 2
        GametypeEnum.SHOOT,
      );
    }

    this.logger.debug('Handling game queue...Done!');
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
