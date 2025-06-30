import { AuthorityEnum } from 'src/users/enums/authority.enum';
import { TokenType } from '../enum/token-type.enum';

export class TokenPayloadEntity {
  user: number;
  type: TokenType;
  authority: AuthorityEnum[];
}
