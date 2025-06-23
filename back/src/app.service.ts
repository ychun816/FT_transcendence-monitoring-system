import { Injectable } from '@nestjs/common';
import packageInfo from '../package.json';
import moment from 'moment';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getStatus(): string {
    return 'UP';
  }

  getInfo(): Record<string, string> {
    return {
      state: process.env.NODE_ENV || 'undefined',
      version: packageInfo.version,
    };
  }

  getTime(): string {
    return moment().format('YYYY-MM-DD HH:mm:ss');
  }
}
