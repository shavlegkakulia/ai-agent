import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthRequest } from 'types/auth';
import { AuthThrottlerGuard } from '../auth/Guards/Auth-throttler.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthThrottlerGuard)
  @Get('profile')
  profile(@Request() req: AuthRequest) {
    return this.userService.profile(req.user);
  }
}
