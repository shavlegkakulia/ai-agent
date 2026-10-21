import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RefreshDTO, UserDTO } from './dto/auth.dto';
import { LocalAuthGuard } from './Guards/local-auth.guard';
import { Public } from './decorators/public-decorator';
import { AuthRequest } from 'types/auth';
import { JwtRefreshAuthGuard } from './Guards/jwt-refresh-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req: AuthRequest) {
    return this.authService.login(req.user);
  }

  @Public()
  @Post('register')
  register(@Body() data: UserDTO) {
    return this.authService.register(data);
  }

  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  refresh(@Request() req: AuthRequest) {
    return this.authService.refresh(req);
  }

  @Post('logout')
  logout(@Request() req: AuthRequest, @Body() data: RefreshDTO) {
    return this.authService.logout(req.user.id, data.refresh_token);
  }
}
