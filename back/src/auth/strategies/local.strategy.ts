import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { User } from 'src/users/user.schema';
import { ActivationRequestsService } from 'src/activation-requests/activation-requests.service';
import { UsersService } from 'src/users/users.service';
import { Document } from 'mongoose';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly activationRequestsService: ActivationRequestsService,
    private readonly usersService: UsersService,
  ) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<User & Document> {
    const user = await this.authService.validateUser(email, password);
    // try {
    //   const activationRequest = await this.activationRequestsService.findOne({
    //     user: user._id,
    //     type: ActivationRequestType.USER_EMAIL,
    //   });

    //   // if (activationRequest.status !== ActivationRequestStatus.APPROVED) {
    //   //   // Email not yet verified
    //   //   return user;
    //   // }
    // } catch (e) {
    //   // if no request found - create one
    //   this.usersService.createEmailVerificationRequest(user);
    // }
    return user;
  }
}
