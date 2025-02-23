import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { HttpException } from '@nestjs/common';
import { LoginDto } from '../libs/dto/login.dto';
import { RegistrationDto } from '../libs/dto/registration.dto';

describe('AuthController', () => {
  let authController: AuthController;

  const mockUser = {
    userId: 1,
    firstName: 'Desmond',
    lastName: 'Okeke',
    email: 'desmond@gmail.com',
    password: 'password',
  };

  const mockAuthService = {
    login: jest.fn().mockResolvedValue({
      accessToken: 'mockToken',
      user: mockUser,
    }),
    register: jest.fn().mockResolvedValue({
      id: mockUser.userId,
      ...mockUser,
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        JwtService,
        Reflector,
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('login', () => {
    it('should return user with access token on successful login', async () => {
      const loginDto: LoginDto = {
        email: 'desmond@gmail.com',
        password: 'password',
      };

      const result = await authController.login(loginDto);

      expect(result).toEqual({
        accessToken: 'mockToken',
        user: mockUser,
      });
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw HttpException if login fails', async () => {
      const loginDto: LoginDto = {
        email: 'anyemail@gmail.com',
        password: 'wrongpassword',
      };

      mockAuthService.login.mockResolvedValue(null);

      await expect(authController.login(loginDto)).rejects.toThrow(
        new HttpException('Invalid Credential', 401),
      );
    });
  });

  describe('register', () => {
    it('should register a user and return user data', async () => {
      const registrationDto: RegistrationDto = {
        firstName: 'Desmond',
        lastName: 'Okeke',
        email: 'desmond@gmail.com',
        password: 'password',
      };

      const result = await authController.register(registrationDto);

      expect(result).toEqual({ id: mockUser.userId, ...mockUser });
      expect(mockAuthService.register).toHaveBeenCalledWith(registrationDto);
    });
  });
});
