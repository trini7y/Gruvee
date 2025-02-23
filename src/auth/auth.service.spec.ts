import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../modules/users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../libs/dto/login.dto';
import { RegistrationDto } from '../libs/dto/registration.dto';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let userService: UserService;

  const mockUser = {
    userId: 1,
    firstName: 'Desmond',
    lastName: 'Okeke',
    email: 'desmond@gmail.com',
    password: 'hashedPassword',
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mocked-jwt-token'),
  };

  const mockUserService = {
    findByEmail: jest.fn(),
    createUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('login', () => {
    it('should return access token and user data on successful login', async () => {
      const loginDto: LoginDto = { email: 'desmond@gmail.com', password: 'password' };

      mockUserService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login(loginDto);

      expect(result).toEqual({
        status: 'success',
        message: 'Login successful',
        data: {
          accessToken: 'mocked-jwt-token',
          user: {
            userId: mockUser.userId,
            firstName: mockUser.firstName,
            lastName: mockUser.lastName,
            email: mockUser.email,
          },
        },
      });

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          userId: mockUser.userId,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          email: mockUser.email,
        }
      );
    });

    it('should return an error response if email or password is missing', async () => {
      const loginDto: LoginDto = { email: '', password: 'password' };

      const result = await authService.login(loginDto);

      expect(result).toEqual({
        status: 'Bad request',
        message: 'Email and password are required',
        statusCode: 400,
      });
    });

    it('should return an error response when email is not found', async () => {
      const loginDto: LoginDto = { email: 'nonexistent@gmail.com', password: 'password' };

      mockUserService.findByEmail.mockResolvedValue(null);

      const result = await authService.login(loginDto);

      expect(result).toEqual({
        status: 'Bad request',
        message: 'User not found',
        statusCode: 404,
      });

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(loginDto.email);
    });

    it('should return an error response when authentication fails', async () => {
      const loginDto: LoginDto = { email: 'desmond@gmail.com', password: 'wrongpassword' };

      mockUserService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await authService.login(loginDto);

      expect(result).toEqual({
        status: 'Bad request',
        message: 'Invalid credentials',
        statusCode: 401,
      });
    });
  });

  describe('register', () => {
    it('should register a user and return the user data', async () => {
      const registrationDto: RegistrationDto = {
        firstName: 'Desmond',
        lastName: 'Okeke',
        email: 'desmond@gmail.com',
        password: 'password',
      };

      mockUserService.createUser.mockResolvedValue({
        ...mockUser,
        accessToken: 'mocked-jwt-token',
      });

      const result = await authService.register(registrationDto);

      expect(result).toEqual({
        ...mockUser,
        accessToken: 'mocked-jwt-token',
      });

      expect(mockUserService.createUser).toHaveBeenCalledWith(registrationDto, 'mocked-jwt-token');
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: registrationDto.email,
        firstName: registrationDto.firstName,
        lastName: registrationDto.lastName,
      });
    });
  });
});
