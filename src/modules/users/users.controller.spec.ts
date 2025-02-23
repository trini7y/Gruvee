import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { AuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  const mockUserService = {
    getUserById: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { userId: '123' };
      return true;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        Reflector,
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('getUserData', () => {
    it('should return user data if the authenticated user requests their own data', async () => {
      const mockUser = { userId: '123', name: 'John Doe', email: 'john@example.com' };
      mockUserService.getUserById.mockResolvedValue(mockUser);

      const req = { user: { userId: '123' } };
      const result = await userController.getUserData('123', req);

      expect(result).toEqual(mockUser);
      expect(mockUserService.getUserById).toHaveBeenCalledWith('123');
    });

    it('should return undefined if the authenticated user requests another user\'s data', async () => {
      const req = { user: { userId: '342' } };
      const result = await userController.getUserData('456', req);

      expect(result).toEqual({ status: 'error', message: 'Unauthorized' });
    });
  });
});
