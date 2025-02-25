import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../libs/dto/login.dto';
import { RegistrationDto } from '../libs/dto/registration.dto';
import { UserService } from '../modules/users/users.service';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login({ email, password }: LoginDto) {
    try {
      if (!email || !password) {
        return {
          status: 'Bad request',
          message: 'Email and password are required',
          statusCode: 400,
        };
      }
  
      const user = await this.userService.findByEmail(email);
      if (!user) {
        return {
          status: 'Bad request',
          message: 'User not found',
          statusCode: 404,
        };
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return {
          status: 'Bad request',
          message: 'Invalid credentials',
          statusCode: 401,
        };
      }
  
      const { password: _, ...result } = user;
      const accessToken = this.jwtService.sign(result);
  
      return {
        status: 'success',
        message: 'Login successful',
        data: {
          accessToken,
          user: {
            userId: result.userId,
            firstName: result.firstName,
            lastName: result.lastName,
            email: result.email,
          },
        },
      };
    } catch (error) {
      return {
        status: 'Bad request',
        message: 'Authentication failed',
        statusCode: 401,
      };
    }
  }
  

  async register(payload: RegistrationDto, req: Request) {
    const jwtPayload = {
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName
    };
    
    return this.userService.createUser(payload, req);
  }
}
