import { Controller, Get } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { Public } from '../auth/decorators/public-decorator';

@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Public()
  @Get('refresh-tokens')
  listRefreshTokens() {
    return this.tokensService.listRefreshTokens();
  }
}
