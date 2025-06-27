import {
  PipeTransform,
  ArgumentMetadata,
  Injectable,
  ValidationPipe,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { ParametersInvalidException } from 'src/errors/exceptions/parameters-invalid.exception';

@Injectable()
export class WsValidationPipe
  extends ValidationPipe
  implements PipeTransform<any>
{
  // async transform(value: any, metadata: ArgumentMetadata) {
  //   if (!metadata || !this.toValidate(metadata)) {
  //     return value as unknown;
  //   }

  //   const object = plainToClass(metadata?.metatype, JSON.parse(value));
  //   const errors = await validate(object);
  //   if (errors.length > 0) {
  //     throw new WsException('Wrong message!'); //new BadRequestException('Validation failed');
  //   }
  //   return value;
  // }

  createExceptionFactory() {
    return (validationErrors = []) => {
      if (this.isDetailedOutputDisabled) {
        return new ParametersInvalidException();
      }

      return new ParametersInvalidException(validationErrors);
    };
  }
}
