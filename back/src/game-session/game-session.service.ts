import { Inject, Injectable, Logger } from '@nestjs/common';
import { UserQueue } from './entities/user-queue.entity';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { JwtTokenInvalidException } from 'src/errors/exceptions/jwt-token-invalid.exception';
import { TokenType } from 'src/auth/enum/token-type.enum';
import { User } from 'src/users/user.entity';
import { HttpExceptionFactory } from 'src/errors/http-exception-factory.class';
import { RegisterQueueDto } from './dto/register-queue.dto';
import { UsersService } from 'src/users/users.service';
import { RegisterQueueStatus } from './enum/register-queue-status.enum';
import { GametypeEnum } from './enum/game-type.enum';
import ms from 'ms';
import { GameHistoryService } from 'src/game-history/game-history.service';
import { IngameStatus } from './enum/ingame-status.enum';
import { ActiveGameSession } from './entities/active-game-session.entity';
import { PongData } from './interface/pong-data.interface';
import { v4 as uuidv4 } from 'uuid';
import { AccessNotGrantedException } from 'src/errors/exceptions/access-not-granted.exception';
import { GameConfigDto } from './dto/game-config.dto';
import { ShootData } from './interface/shoot-data.interface';
import { OrientationEnum } from './enum/orientation.enum';
import { GamedataPongDto } from './dto/gamedata-pong.dto';
import { GamedataShootDto } from './dto/gamedata-shoot.dto';

@Injectable()
export class GameSessionService {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(GameHistoryService)
    private readonly gameHistoryService: GameHistoryService,
  ) {}
  readonly userQueue: UserQueue[] = [];
  readonly activeGameSessions: Record<string, ActiveGameSession<unknown>> = {};
  private readonly logger = new Logger(GameSessionService.name);
  private _server: Server | null = null;

  set server(server: Server) {
    this._server = server;
  }

  get server(): Server {
    if (!this._server) {
      throw new Error(
        'Critical server error : Socket.io server instance is not initialized.',
      );
    }
    return this._server;
  }

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

      for (const activeGameSession of Object.values(this.activeGameSessions)) {
        if (
          activeGameSession.players
            .map((user) => user.user.id)
            .includes(user.id)
        ) {
          // TODO : reestablish user session, send info to client
          client.emit('gameSession', this.omitSensitives(activeGameSession));
          return;
        }
      }
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
      client,
    };

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
    const launchGame = () => {
      if (gametype == GametypeEnum.PONG) {
        this.logger.debug(
          `Game : ${gametype} - Creating room for PONG players: ${userQueue.length}`,
        );
        this.handleGame(userQueue); // TODO : How to handle promise?
      } else {
        this.logger.debug(
          `Game : ${gametype} - Creating room for SHOOT players: ${userQueue.length}`,
        );
        this.handleGame(userQueue); // TODO : How to handle promise?
      }
    };
    const timeDiffMs =
      Date.now() - userQueue[0].entryTimestamp.getUTCMilliseconds();
    if (timeDiffMs > ms('60s')) {
      // If user waiting >= 2 , create room
      launchGame();
    } else if (timeDiffMs > ms('30s') && userQueue.length >= 4) {
      // If user waiting >= 4 , create room
      launchGame();
    } else if (timeDiffMs > ms('20s') && userQueue.length >= 8) {
      // If user waiting >= 8 , create room
      launchGame();
    } else {
      this.logger.debug(
        `Game : ${gametype} - Not enough players. Waiting time: ${ms(timeDiffMs)}`,
      );
    }
  }

  getSeperatedUserQueue(): {
    [GametypeEnum.PONG]: UserQueue[];
    [GametypeEnum.SHOOT]: UserQueue[];
  } {
    const queue: {
      [GametypeEnum.PONG]: UserQueue[];
      [GametypeEnum.SHOOT]: UserQueue[];
    } = {
      [GametypeEnum.PONG]: [],
      [GametypeEnum.SHOOT]: [],
    };

    this.userQueue.forEach((userQueue) => {
      if (userQueue.gametype === GametypeEnum.PONG) {
        queue[GametypeEnum.PONG].push(userQueue);
      } else {
        queue[GametypeEnum.SHOOT].push(userQueue);
      }
    });

    return queue;
  }

  handleGameQueue() {
    this.logger.debug('Handling game queue...');

    const queue = this.getSeperatedUserQueue();

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

  private omitSensitives<T>(
    activeGameSession: ActiveGameSession<T>,
  ): Pick<
    ActiveGameSession<T>,
    'id' | 'data' | 'status' | 'gametype' | 'tournamentHistory'
  > {
    const { id, data, status, gametype, tournamentHistory } = activeGameSession;
    return { id, data, status, gametype, tournamentHistory };
  }

  private getTournamentHistory(UserQueue: UserQueue[]): [string, string][][] {
    const tournamentHistory: [string, string][] = [];
    let tournamentCache: string[] = [];
    for (const user of UserQueue) {
      tournamentCache.push(user.user.id);
      if (tournamentCache.length === 2) {
        tournamentHistory.push(tournamentCache as [string, string]);
        tournamentCache = [];
      }
    }
    return [tournamentHistory];
  }

  // TODO : handle game
  async handleGame(usersList: UserQueue[]) {
    const roomId = uuidv4();

    const room = this.server.of('/').in(roomId);

    const activeGameSession: ActiveGameSession<unknown> = {
      id: roomId,
      gametype: GametypeEnum.PONG,
      status: IngameStatus.WAITING_FOR_PLAYERS,
      players: usersList,
      createdAt: Date.now(),
      tournamentHistory: this.getTournamentHistory(usersList),
      room,
      data: null,
      lobbyData: {},
      winners: [],
      classNumber: 0,
      currentClass: 1,
      mapVoteData: [],
    };

    for (const userQueue of usersList) {
      userQueue.client.emit(
        'ingameComm',
        this.omitSensitives(activeGameSession),
      );
    }

    this.activeGameSessions[activeGameSession.id] = activeGameSession;

    for (const user of usersList) {
      await user.client.join(roomId);
    }

    while (true) {
      // Wait all players to enter the game
      if (
        (await room.fetchSockets()).length === activeGameSession.players.length
      ) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
      this.logger.debug(`Room : ${roomId} - Waiting for players to enter...`);
    }

    activeGameSession.status = IngameStatus.LOBBY;

    room.emit('ingameComm', this.omitSensitives(activeGameSession));

    while (true) {
      // Wait all players to be ready
      const allReady = activeGameSession.players.every(
        (userQueue) =>
          userQueue.client.handshake.auth.user.id in
            activeGameSession.lobbyData &&
          activeGameSession.lobbyData[userQueue.client.handshake.auth.user.id]
            .ready,
      );

      if (allReady) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
      this.logger.debug(
        `Room : ${roomId} - Waiting for players to be ready...`,
      );
    }

    this.logger.debug(
      `Room : ${roomId} - All players are ready, starting game...`,
    );

    activeGameSession.classNumber = Math.log2(activeGameSession.players.length);

    while (activeGameSession.currentClass <= activeGameSession.classNumber) {
      this.logger.debug(
        `Room : ${roomId} - Starting class ${activeGameSession.currentClass}/${activeGameSession.classNumber}`,
      );

      let userTemp: UserQueue | null = null;
      for (const userQueue of activeGameSession.players) {
        if (!userTemp) {
          userTemp = userQueue;
          continue;
        }

        const users = [userTemp, userQueue];
        userTemp = null;

        if (activeGameSession.gametype === GametypeEnum.PONG) {
          const pongData: PongData = {
            ball: { x: 390, y: 200 },
            player1: {
              user: users[0].user,
              score: 0,
              y: 200,
            },
            player2: {
              user: users[1].user,
              score: 0,
              y: 200,
            },
          };
          activeGameSession.data = pongData;
        } else if (activeGameSession.gametype === GametypeEnum.SHOOT) {
          const shootData: ShootData = {
            player1: {
              user: users[0].user,
              score: 0,
              x: 150,
              y: 350,
              orentation: OrientationEnum.RIGHT,
              balls: [],
            },
            player2: {
              user: users[1].user,
              score: 0,
              x: 1475,
              y: 350,
              orentation: OrientationEnum.LEFT,
              balls: [],
            },
          };
          activeGameSession.data = shootData;
        }

        activeGameSession.status = IngameStatus.IN_PROGRESS;

        room.emit('ingameComm', this.omitSensitives(activeGameSession));

        while (activeGameSession.status === IngameStatus.IN_PROGRESS) {
          room.emit('gamedata', activeGameSession.data);
        }

        room.emit('ingameComm', this.omitSensitives(activeGameSession));

        activeGameSession.status = IngameStatus.NEXT_ROUND_SELECT;
      }

      this.logger.debug(
        `Room : ${roomId} - Class ${activeGameSession.currentClass}/${activeGameSession.classNumber} finished`,
      );

      activeGameSession.currentClass++;
    }

    activeGameSession.status = IngameStatus.TERMINATED;

    room.emit('ingameComm', this.omitSensitives(activeGameSession));

    const gameHistory = await this.gameHistoryService.create({
      // TODO
      gametype: GametypeEnum.PONG,
      players: usersList.map((userQueue) => userQueue.user.id),
    });
  }

  readyUser(client: Socket) {
    const user = client.handshake.auth.user as User;
    const activeGameSession = this.getActiveGameSessionByUserId(user.id);

    if (activeGameSession.status !== IngameStatus.LOBBY) {
      throw new AccessNotGrantedException();
    }
    activeGameSession.lobbyData[user.id].ready = true;
    activeGameSession.room.emit('readyUser', user.id);
    this.logger.debug(`User ready : ${user.id} - ${user.email}`);
  }

  cancelReadyUser(client: Socket) {
    const user = client.handshake.auth.user as User;
    const activeGameSession = this.getActiveGameSessionByUserId(user.id);

    if (activeGameSession.status !== IngameStatus.LOBBY) {
      throw new AccessNotGrantedException();
    }
    activeGameSession.lobbyData[user.id].ready = false;
    activeGameSession.room.emit('cancelReadyUser', user.id);
    this.logger.debug(`User cancel ready : ${user.id} - ${user.email}`);
  }

  getActiveGameSessionById<T>(id: string): ActiveGameSession<T> {
    const activeGameSession = this.activeGameSessions[id];
    if (!activeGameSession) {
      throw new AccessNotGrantedException();
    }
    return activeGameSession as ActiveGameSession<T>;
  }

  getActiveGameSessionByUserId<T>(userId: string): ActiveGameSession<T> {
    const activeGameSession = Object.values(this.activeGameSessions).find(
      (session) => session.players.map((user) => user.user.id).includes(userId),
    );
    if (!activeGameSession) {
      throw new AccessNotGrantedException();
    }
    return activeGameSession as ActiveGameSession<T>;
  }

  gameConfig(client: Socket, gameConfigDto: GameConfigDto) {
    const user = client.handshake.auth.user as User;
    const activeGameSession = this.getActiveGameSessionByUserId(user.id);
    if (activeGameSession.status === IngameStatus.LOBBY) {
      activeGameSession.lobbyData[user.id].color = gameConfigDto.color;
      activeGameSession.lobbyData[user.id].map = gameConfigDto.map;
      activeGameSession.room.emit('gameConfig', {
        user: user.id,
        color: gameConfigDto.color,
        map: gameConfigDto.map,
      });
    } else if (activeGameSession.status === IngameStatus.NEXT_ROUND_SELECT) {
      if (activeGameSession.lobbyData[user.id].ready === true) {
        throw new AccessNotGrantedException();
      }
      activeGameSession.lobbyData[user.id].color = gameConfigDto.color;
      activeGameSession.lobbyData[user.id].map = gameConfigDto.map;
      activeGameSession.lobbyData[user.id].ready = true;
      activeGameSession.room.emit('gameConfig', {
        user: user.id,
        color: gameConfigDto.color,
        map: gameConfigDto.map,
      });
    } else {
      throw new AccessNotGrantedException();
    }
  }

  gamedataPong(client: Socket, data: GamedataPongDto) {
    const user = client.handshake.auth.user as User;
    const activeGameSession = this.getActiveGameSessionByUserId<PongData>(
      user.id,
    );

    if (activeGameSession.gametype !== GametypeEnum.PONG) {
      throw new AccessNotGrantedException();
    }

    if (activeGameSession.status !== IngameStatus.IN_PROGRESS) {
      throw new AccessNotGrantedException();
    }

    if (activeGameSession.data?.player1.user.id === user.id) {
      activeGameSession.data.player1.y = data.y;
    } else if (activeGameSession.data?.player2.user.id === user.id) {
      activeGameSession.data.player2.y = data.y;
    } else {
      throw new AccessNotGrantedException();
    }
  }

  gamedataShoot(client: Socket, data: GamedataShootDto) {
    const user = client.handshake.auth.user as User;
    const activeGameSession = this.getActiveGameSessionByUserId<ShootData>(
      user.id,
    );

    if (activeGameSession.gametype !== GametypeEnum.SHOOT) {
      throw new AccessNotGrantedException();
    }

    if (activeGameSession.status !== IngameStatus.IN_PROGRESS) {
      throw new AccessNotGrantedException();
    }

    if (activeGameSession.data?.player1.user.id === user.id) {
      activeGameSession.data.player1.x = data.x;
      activeGameSession.data.player1.y = data.y;
      activeGameSession.data.player1.orentation = data.orientation;
      activeGameSession.data.player1.balls = data.balls;
    } else if (activeGameSession.data?.player2.user.id === user.id) {
      activeGameSession.data.player2.x = data.x;
      activeGameSession.data.player2.y = data.y;
      activeGameSession.data.player2.orentation = data.orientation;
      activeGameSession.data.player2.balls = data.balls;
    } else {
      throw new AccessNotGrantedException();
    }
  }

  gamedataWinner(client: Socket, data: string) {
    const user = client.handshake.auth.user as User;
    const activeGameSession = this.getActiveGameSessionByUserId(user.id);

    if (activeGameSession.status !== IngameStatus.IN_PROGRESS) {
      throw new AccessNotGrantedException();
    }

    if (
      !activeGameSession.players
        .map((userQueue) => userQueue.user.id)
        .includes(data)
    ) {
      throw new AccessNotGrantedException();
    }

    activeGameSession.winners.push(
      activeGameSession.players.find(
        (userQueue) => userQueue.user.id === data,
      ) as UserQueue,
    );

    activeGameSession.status = IngameStatus.INTERRUPTED;

    activeGameSession.room.emit('gamedataWinner', data);
  }
}
