import { ExecutionContext, Inject, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { TokenExpiredError } from 'jsonwebtoken';
import { AuthorizationFailedException } from 'src/errors/exceptions/authorization-failed.exception';
import { JwtTokenExpiredException } from 'src/errors/exceptions/jwt-token-expired.exception';
import { AuthService } from '../auth.service';
import { FastifyRequest } from 'fastify';

@Injectable()
export class JwtAuthLooseGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    @Inject(AuthService) private authService: AuthService,
  ) {
    super(reflector);
  }

  private logger = new Logger(JwtAuthLooseGuard.name);

  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser | null {
    const req = context.switchToHttp().getRequest<FastifyRequest>();

    const token = req.cookies['Authorization'];

    if (!token) return null; // If no authorization info exists, pass null

    if (info instanceof TokenExpiredError) {
      throw new JwtTokenExpiredException();
    }

    if (err || !user) {
      this.logger.debug(info);
      throw new AuthorizationFailedException();
    }

    return user as unknown as TUser;
  }
}
