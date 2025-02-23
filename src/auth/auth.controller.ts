import {
  Body,
  Controller,
  Post,
  HttpException,
} from '@nestjs/common';
import { RegistrationDto } from '../libs/dto/registration.dto';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginDto } from '../libs/dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() payload: LoginDto) {
    const user = await this.authService.login(payload);
    if (!user) throw new HttpException('Invalid Credential', 401);
    return user;
  }

  @Public()
  @Post('register')
  register(@Body() payload: RegistrationDto) {
    return this.authService.register(payload);
  }
}
