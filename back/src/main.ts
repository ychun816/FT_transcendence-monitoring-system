import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ParametersInvalidException } from './errors/exceptions/parameters-invalid.exception';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import packageInfo from '../package.json';
import { join } from 'path';
import fastifyCookie from '@fastify/cookie';
import helmet from '@fastify/helmet';

async function bootstrap() {
  const logger = new Logger('Main');

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.useStaticAssets({
    root: join(__dirname, '..', 'public'),
    prefix: '/public/',
  });

  if (process.env.NODE_ENV !== 'production') {
    // Debug
  }

  app.enableCors({
    origin: process.env.REQUEST_URI || '*',
    credentials: true,
  });

  app.enableVersioning({
    type: VersioningType.URI,
  });

  await app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET,
  });
  await app.register(helmet);

  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: true,
      transform: true,
      whitelist: true,
      exceptionFactory(errors) {
        throw new ParametersInvalidException(errors);
      },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle(packageInfo.name)
    .setDescription('Nest.JS applied new version')
    .setVersion(packageInfo.version)
    .addCookieAuth(
      'Authentication',
      {
        type: 'apiKey',
        in: 'cookie',
        name: 'Authentication',
      },
      'Authentication',
    )
    .addCookieAuth(
      'RefreshToken',
      {
        type: 'apiKey',
        in: 'cookie',
        name: 'RefreshToken',
      },
      'RefreshToken',
    )
    // .addTag('')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig, {
    deepScanRoutes: true,
  });
  SwaggerModule.setup('dev/api', app, swaggerDocument);

  await app.listen(process.env.PORT ?? 3000);

  logger.log(
    `Application is running on ${await app.getUrl()} , NODE_ENV=${process.env.NODE_ENV}`,
  );
}

bootstrap();
