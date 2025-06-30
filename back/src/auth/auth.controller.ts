import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Throttle } from '@nestjs/throttler';
import { RequestWithUser } from './interfaces/request-with-user.interface';
import { FastifyReply } from 'fastify';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 300 } })
  @Post('login')
  login(@Req() req: RequestWithUser, @Res() res: FastifyReply) {
    const { user } = req;

    res.setCookie(
      ...this.authService.getCookieConfigTokenGenerationIntegrated(user),
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@Res() res: FastifyReply) {
    res.clearCookie('Authorization');
  }

  @Get('verify/token')
  @Roles()
  verifyToken() {
    return 'OK';
  }
}
