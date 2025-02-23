import { Test, TestingModule } from '@nestjs/testing';
import { CanActivate } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { CreateRoleDto } from '../../libs/dto/create-role.dto';
import { CreatePermissionDto } from '../../libs/dto/create-permission.dto';
import { AuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';

describe('RoleController', () => {
  let controller: RoleController;
  let roleService: RoleService;

  const mockRoleService = {
    createRole: jest.fn().mockImplementation((dto) => ({
      id: 'role-1',
      ...dto,
    })),
    findAllRoles: jest.fn().mockResolvedValue([
      { id: 'role-1', name: 'Admin' },
      { id: 'role-2', name: 'User' },
    ]),
    createPermission: jest.fn().mockImplementation((dto) => ({
      id: 'permission-1',
      ...dto,
    })),
    findAllPermissions: jest.fn().mockResolvedValue([
      { id: 'permission-1', name: 'Read' },
      { id: 'permission-2', name: 'Write' },
    ]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [{ provide: RoleService, useValue: mockRoleService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) } as CanActivate)
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) } as CanActivate)
      .compile();

    controller = module.get<RoleController>(RoleController);
    roleService = module.get<RoleService>(RoleService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createRole', () => {
    it('should create and return a new role', async () => {
      const createRoleDto: CreateRoleDto = { name: 'Admin', permissions:[] };

      const result = await controller.createRole(createRoleDto);

      expect(result).toEqual({ id: 'role-1', ...createRoleDto });
      expect(roleService.createRole).toHaveBeenCalledWith(createRoleDto);
    });
  });

  describe('getAllRoles', () => {
    it('should return all roles', async () => {
      const result = await controller.getAllRoles();

      expect(result).toEqual([
        { id: 'role-1', name: 'Admin' },
        { id: 'role-2', name: 'User' },
      ]);
      expect(roleService.findAllRoles).toHaveBeenCalled();
    });
  });

  describe('createPermission', () => {
    it('should create and return a new permission', async () => {
      const createPermissionDto: CreatePermissionDto = { name: 'Read' };

      const result = await controller.createPermission(createPermissionDto);

      expect(result).toEqual({ id: 'permission-1', ...createPermissionDto });
      expect(roleService.createPermission).toHaveBeenCalledWith(createPermissionDto);
    });
  });

  describe('getAllPermissions', () => {
    it('should return all permissions', async () => {
      const result = await controller.getAllPermissions();

      expect(result).toEqual([
        { id: 'permission-1', name: 'Read' },
        { id: 'permission-2', name: 'Write' },
      ]);
      expect(roleService.findAllPermissions).toHaveBeenCalled();
    });
  });
});
