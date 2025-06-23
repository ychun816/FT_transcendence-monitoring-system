import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from 'src/users/user.schema';
import { UsersService } from 'src/users/users.service';
import { TokenPayloadEntity } from './entities/token-payload.entity';
import jwt from 'jsonwebtoken';
import { pbkdf2Sync, randomBytes } from 'crypto';
import { SessionsService } from 'src/sessions/sessions.service';
import ms, { StringValue } from 'ms';
import { JwtTokenInvalidException } from 'src/errors/exceptions/jwt-token-invalid.exception';
import { JwtTokenExpiredException } from 'src/errors/exceptions/jwt-token-expired.exception';
import { AuthorizationFailedException } from 'src/errors/exceptions/authorization-failed.exception';
import { TokenType } from './enum/token-type.enum';
import { CookieOptions } from 'express';
import { BannedException } from 'src/errors/exceptions/banned.exception';
import { UserRestrictionsService } from 'src/user-restrictions/user-restrictions.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
    private configService: ConfigService,
    private sessionService: SessionsService,
    private userRestrictionsService: UserRestrictionsService,
  ) {}

  async createToken(
    payload: Record<string, any>,
    type: TokenType,
    expiration: string | number | undefined = undefined,
  ): Promise<string> {
    const expireTime = ((): StringValue | number => {
      if (expiration) return expiration as StringValue | number;
      if (type === TokenType.ACCESS) {
        return this.configService.getOrThrow('ACCESS_TOKEN_EXPIRATION_TIME');
      } else if (type === TokenType.REFRESH) {
        return this.configService.getOrThrow('REFRESH_TOKEN_EXPIRATION_TIME');
      } else {
        return '1h';
      }
    })();

    const tokenKey = ((): string => {
      switch (type) {
        case TokenType.ACCESS:
          return this.configService.getOrThrow('ACCESS_TOKEN_KEY');
        case TokenType.REFRESH:
          return this.configService.getOrThrow('REFRESH_TOKEN_KEY');
        default:
          return this.configService.getOrThrow('TOKEN_KEY');
      }
    })();

    const jwtSettings: jwt.SignOptions = {
      expiresIn: expireTime,
      jwtid: `${Date.now()}_${TokenType[type]}`,
      issuer:
        this.configService.getOrThrow('NODE_ENV') === 'development'
          ? '*'
          : this.configService.get('REQUEST_URI') || '*',
    };

    const result = jwt.sign(
      {
        ...payload,
        type,
      },
      tokenKey,
      jwtSettings,
    );

    if (type === TokenType.REFRESH) {
      const jwtDecoded: any = jwt.decode(result);
      if (!jwtDecoded.exp || !jwtDecoded.jti || !jwtDecoded.user) {
        throw new JwtTokenInvalidException();
      }
      await this.sessionService.create({
        expire: jwtDecoded.exp,
        user: jwtDecoded.user,
        jwtid: jwtDecoded.jti,
      });
    }

    return result;
  }

  async createAuthToken(
    user: UserDocument,
    type: TokenType.ACCESS | TokenType.REFRESH,
  ): Promise<string> {
    const tokenPayload: TokenPayloadEntity = {
      user: user._id,
      authority: user.authority,
      type,
    };

    const result = await this.createToken(tokenPayload, type);

    return result;
  }

  async verifyToken<T = Record<string, any>>(
    token: string,
    type: TokenType,
    customKey?: string,
  ): Promise<T & jwt.JwtPayload> {
    const tokenValue = ((): T & jwt.JwtPayload => {
      try {
        let tokenKey: string;

        if (customKey) {
          tokenKey = customKey;
        } else {
          switch (type) {
            case TokenType.ACCESS:
              tokenKey = this.configService.getOrThrow('ACCESS_TOKEN_KEY');
              break;
            case TokenType.REFRESH:
              tokenKey = this.configService.getOrThrow('REFRESH_TOKEN_KEY');
              break;
            default:
              tokenKey = this.configService.getOrThrow('TOKEN_KEY');
              break;
          }
        }

        const result = jwt.verify(token, tokenKey);

        if (typeof result === 'string') {
          throw new JwtTokenInvalidException();
        }

        return result as any;
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          throw new JwtTokenExpiredException();
        }
      }
    })();

    if (type === TokenType.REFRESH) {
      try {
        await this.sessionService.findByJwtId(tokenValue.jti);
      } catch {
        throw new JwtTokenInvalidException();
      }
    }

    if (!tokenValue?.type && tokenValue.type !== 0) {
      throw new JwtTokenInvalidException();
    }

    if (tokenValue.type !== type) {
      throw new JwtTokenInvalidException();
    }

    return tokenValue;
  }

  createPassword(
    password: string,
    customSalt: string = undefined,
  ): { password: string; enckey: string } {
    const buf: string = customSalt || randomBytes(64).toString('base64');
    const key: string = pbkdf2Sync(
      password,
      buf,
      100000,
      64,
      'sha512',
    ).toString('base64');

    return { password: key, enckey: buf };
  }

  verifyPassword(
    password: string,
    encryptedPassword: string,
    enckey: string,
  ): boolean {
    const key: string = pbkdf2Sync(
      password,
      enckey,
      100000,
      64,
      'sha512',
    ).toString('base64');

    return key === encryptedPassword;
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<User & Document> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new AuthorizationFailedException();
    }

    if (!this.verifyPassword(password, user.password, user.enckey)) {
      throw new AuthorizationFailedException();
    }

    try {
      const userRestriction = await this.userRestrictionsService.findOneSelf(
        user._id,
        undefined,
      );
      throw new BannedException({ reason: userRestriction.reason });
    } catch {}

    return user;
  }

  async getCookieConfigTokenGenerationIntegrated(
    user: UserDocument,
    type: TokenType.ACCESS | TokenType.REFRESH,
  ): Promise<[string, string | any, CookieOptions?]> {
    const token = await this.createAuthToken(user, type);

    return [
      type === TokenType.ACCESS ? `Authentication` : `RefreshToken`,
      token,
      {
        httpOnly: true,
        path: '/',
        maxAge: parseInt(
          ms(
            this.configService.getOrThrow(
              type === TokenType.ACCESS
                ? 'ACCESS_TOKEN_EXPIRATION_TIME'
                : 'REFRESH_TOKEN_EXPIRATION_TIME',
            ),
          ),
        ),
      },
    ];
  }

  getCookieLogout(): string[] {
    return [
      `Authentication=; HttpOnly; Path=/; Max-Age=0`,
      `RefreshToken=; HttpOnly; Path=/; Max-Age=0`,
    ];
  }
}
