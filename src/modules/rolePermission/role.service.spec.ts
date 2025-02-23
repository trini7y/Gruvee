import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleService } from './role.service';
import { Role } from '../../libs/entities/role.entity';
import { Permission } from '../../libs/entities/permission.entity';
import { CreateRoleDto } from '../../libs/dto/create-role.dto';
import { CreatePermissionDto } from '../../libs/dto/create-permission.dto';

describe('RoleService', () => {
  let service: RoleService;
  let roleRepository: Repository<Role>;
  let permissionRepository: Repository<Permission>;

  const mockRoleRepository = {
    create: jest.fn((dto) => ({ id: 1, ...dto })),
    save: jest.fn((role) => Promise.resolve(role)),
    find: jest.fn().mockResolvedValue([
      { id: 1, name: 'Admin', permissions: [] },
      { id: 2, name: 'User', permissions: [] },
    ]),
  };

  const mockPermissionRepository = {
    create: jest.fn((dto) => ({ id: 1, ...dto })),
    save: jest.fn((permission) => Promise.resolve(permission)),
    find: jest.fn().mockResolvedValue([
      { id: 1, name: 'Read' },
      { id: 2, name: 'Write' },
    ]),
    findOne: jest.fn().mockImplementation((criteria) =>
      Promise.resolve(
        criteria.where.id === 1
          ? { id: 1, name: 'Read' }
          : null,
      ),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        { provide: getRepositoryToken(Role), useValue: mockRoleRepository },
        { provide: getRepositoryToken(Permission), useValue: mockPermissionRepository },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
    permissionRepository = module.get<Repository<Permission>>(getRepositoryToken(Permission));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRole', () => {
    it('should create and return a new role', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'Admin',
        permissions: [1],
      };

      jest.spyOn(permissionRepository, 'find').mockResolvedValue([
        { id: 1, name: 'Read' },
      ]);

      const result = await service.createRole(createRoleDto);

      expect(result).toEqual({
        id: 1,
        name: 'Admin',
        permissions: [{ id: 1, name: 'Read' }],
      });

      expect(roleRepository.create).toHaveBeenCalledWith({
        name: 'Admin',
        permissions: [{ id: 1, name: 'Read' }],
      });
      expect(roleRepository.save).toHaveBeenCalled();
    });
  });

  describe('findAllRoles', () => {
    it('should return all roles', async () => {
      const result = await service.findAllRoles();

      expect(result).toEqual([
        { id: 1, name: 'Admin', permissions: [] },
        { id: 2, name: 'User', permissions: [] },
      ]);
      expect(roleRepository.find).toHaveBeenCalledWith({ relations: ['permissions'] });
    });
  });

  describe('createPermission', () => {
    it('should create and return a new permission', async () => {
      const createPermissionDto: CreatePermissionDto = { name: 'Read' };

      const result = await service.createPermission(createPermissionDto);

      expect(result).toEqual({ id: 1, name: 'Read' });
      expect(permissionRepository.create).toHaveBeenCalledWith(createPermissionDto);
      expect(permissionRepository.save).toHaveBeenCalled();
    });
  });

  describe('findAllPermissions', () => {
    it('should return all permissions', async () => {
      const result = await service.findAllPermissions();
      expect(result).toEqual([
        { id: 1, name: 'Read' },
        { id: 2, name: 'Write' },
      ]);
      expect(permissionRepository.find).toHaveBeenCalled();
    });
  });
});
