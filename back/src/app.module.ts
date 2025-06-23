import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ErrorsModule } from './errors/errors.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { CookieResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { join } from 'path';
import {
  ThrottlerGuard,
  ThrottlerModule,
  ThrottlerModuleOptions,
} from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './tasks/tasks.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { HttpExceptionFactoryFilter } from './filters/http-exception-factory.filter';
import { NotFoundExceptionFilter } from './filters/not-found-exception.filter';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilsService } from './utils/utils.service';
import { UtilsModule } from './utils/utils.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      // validationSchema: Joi.object({
      //   PORT: Joi.number().default(4000),
      //   DB_HOST: Joi.string().required(),
      //   DB_NAME: Joi.string().required(),
      //   DB_USER: Joi.string().required(),
      //   DB_PASS: Joi.string().required(),
      //   REQUEST_URI: Joi.string().uri().required(),
      //   ACCESS_TOKEN_KEY: Joi.string().required(),
      //   ACCESS_TOKEN_EXPIRATION_TIME: Joi.string().required(),
      //   REFRESH_TOKEN_KEY: Joi.string().required(),
      //   REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().required(),
      //   COOKIE_SECRET: Joi.string().required(),
      //   TOKEN_KEY: Joi.string(),
      //   THROTTLE_TTL: Joi.number().default(300),
      //   THROTTLE_LIMIT: Joi.number().default(100),
      // }),
      // validationOptions: {
      //   allowUnknown: true,
      //   abortEarly: true,
      // },
    }),
    // DB Module here
    I18nModule.forRoot({
      fallbackLanguage: 'en-US',
      loaderOptions: {
        path: join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        { use: CookieResolver, options: ['lang', 'NEXT_LOCALE'] },
      ],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): ThrottlerModuleOptions => ({
        throttlers: [
          {
            ttl: config.getOrThrow<number>('THROTTLE_TTL', 300),
            limit: config.getOrThrow<number>('THROTTLE_LIMIT', 100),
          },
        ],
      }),
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'sqlite',
        host: config.getOrThrow<string>('DB_HOST'),
        port: config.getOrThrow<number>('DB_PORT'),
        username: config.getOrThrow<string>('DB_USER'),
        password: config.getOrThrow<string>('DB_PASS'),
        database: config.getOrThrow<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true, // Set to false in production
      }),
    }),
    ErrorsModule,
    TasksModule,
    UsersModule,
    UtilsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: HttpExceptionFactoryFilter },
    { provide: APP_FILTER, useClass: NotFoundExceptionFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    UtilsService,
  ],
})
export class AppModule {}
