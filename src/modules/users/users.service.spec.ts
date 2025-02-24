import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './users.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../libs/entities/users.entity';
import { RegistrationDto } from '../../libs/dto/registration.dto';
import * as bcrypt from 'bcrypt';
import { NotFoundException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('mocked-salt'),
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    }),
  };

  const mockUser: User = {
    userId: '123',
    firstName: 'Desmond',
    lastName: 'Okeke',
    email: 'desmond@gmail.com',
    password: 'hashed-password',
    roles: [],
    events: [],
    tasks: [],
    hasId: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    softRemove: jest.fn(),
    recover: jest.fn(),
    reload: jest.fn(),
  };
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('createUser', () => {
    it('should return an error response if payload is missing', async () => {
      const result = await userService.createUser(null, 'mocked-access-token');
      expect(result).toEqual({
        status: 'Bad request',
        message: 'No payload provided',
        statusCode: 400,
      });
    });

    it('should return an error response if email is already taken', async () => {
      jest.spyOn(userService, 'isEmailTaken').mockResolvedValue(true);

      const registrationDto: RegistrationDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'taken@gmail.com',
        password: 'password123',
      };

      const result = await userService.createUser(registrationDto, 'mocked-access-token');

      expect(result).toEqual({
        status: 'Bad request',
        message: 'Email has been taken',
        statusCode: 400,
      });
    });

    it('should create and return a new user', async () => {
      jest.spyOn(userService, 'isEmailTaken').mockResolvedValue(false);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const registrationDto: RegistrationDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'new@gmail.com',
        password: 'password123',
      };

      const result = await userService.createUser(registrationDto, 'mocked-access-token');

      expect(result).toEqual({
        status: 'success',
        message: 'Registration successful',
        data: {
          accessToken: 'mocked-access-token',
          user: {
            userId: '123',
            firstName: 'Desmond',
            lastName: 'Okeke',
            email: 'desmond@gmail.com',
          },
        },
      });

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...registrationDto,
        password: 'hashed-password',
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('getUserById', () => {
    it('should return user data if user exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await userService.getUserById('123');

      expect(result).toEqual({
        status: 'success',
        message: 'User data fetched successfully',
        data: {
          userId: '123',
          firstName: 'Desmond',
          lastName: 'Okeke',
          email: 'desmond@gmail.com',
        },
      });

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { userId: '123' } });
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(userService.getUserById('456')).rejects.toThrow(
        new NotFoundException('User with id 456 not found'),
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user if email exists', async () => {
      mockUserRepository.createQueryBuilder().getOne.mockResolvedValue(mockUser);

      const result = await userService.findByEmail('desmond@gmail.com');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('should throw NotFoundException if email is not found', async () => {
      mockUserRepository.createQueryBuilder().getOne.mockResolvedValue(null);

      await expect(userService.findByEmail('missing@gmail.com')).rejects.toThrow(
        new NotFoundException('User with email missing@gmail.com not found'),
      );
    });
  });

  describe('isEmailTaken', () => {
    it('should return true if email is already taken', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const result = await userService.isEmailTaken('desmond@gmail.com');
      expect(result).toBe(true);
    });

    it('should return false if email is not taken', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      const result = await userService.isEmailTaken('new@gmail.com');
      expect(result).toBe(false);
    });
  });

  describe('findOne', () => {
    it('should return user if found', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const result = await userService.findOne('123');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(userService.findOne('999')).rejects.toThrow(
        new NotFoundException('User not found'),
      );
    });
  });

  describe('findUserWithRoles', () => {
    it('should return user with roles if found', async () => {
      mockUserRepository.findOne.mockResolvedValue({ ...mockUser, roles: ['Admin'] });
      const result = await userService.findUserWithRoles('123');
      expect(result).toEqual({ ...mockUser, roles: ['Admin'] });
    });

    it('should return null if user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      const result = await userService.findUserWithRoles('999');
      expect(result).toBeNull();
    });
  });

  describe('hashPassword', () => {
    it('should return hashed password', async () => {
      const password = 'password123';
      const hashedPassword = await userService.hashPassword(password);
      expect(hashedPassword).toBe('hashed-password');
      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 'mocked-salt');
    });
  });
});
