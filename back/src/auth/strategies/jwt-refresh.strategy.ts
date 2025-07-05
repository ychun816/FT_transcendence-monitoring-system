import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtTokenInvalidException } from 'src/errors/exceptions/jwt-token-invalid.exception';
import { UsersService } from 'src/users/users.service';
import { TokenPayloadEntity } from '../entities/token-payload.entity';
import jwt from 'jsonwebtoken';
import { SessionsService } from 'src/sessions/sessions.service';
import mongoose from 'mongoose';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private sessionService: SessionsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.RefreshToken;
        },
      ]),
      secretOrKey: configService.getOrThrow<string>('REFRESH_TOKEN_KEY'),
    });
  }

  async validate(payload: TokenPayloadEntity & jwt.JwtPayload) {
    const jwtid = payload.jti as string | undefined;
    const userid = payload.user as mongoose.Types.ObjectId | undefined;

    if (!jwtid || !userid) {
      throw new JwtTokenInvalidException();
    }

    try {
      await this.sessionService.findByJwtId(payload.jti);
    } catch {
      throw new JwtTokenInvalidException();
    }

    const user = await this.usersService.findByDocId(userid);

    return user;
  }
}
