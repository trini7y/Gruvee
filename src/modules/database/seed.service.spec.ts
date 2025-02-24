import { Test, TestingModule } from '@nestjs/testing';
import { SeedService } from './seed.service';
import { Repository } from 'typeorm';
import { Role } from '../../libs/entities/role.entity';
import { Permission } from '../../libs/entities/permission.entity';
import { User } from '../../libs/entities/users.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

describe('SeedService', () => {
  let seedService: SeedService;
  let roleRepository: Repository<Role>;
  let permissionRepository: Repository<Permission>;
  let userRepository: Repository<User>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    insert: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        {
          provide: getRepositoryToken(Role),
          useValue: { ...mockRepository },
        },
        {
          provide: getRepositoryToken(Permission),
          useValue: { ...mockRepository },
        },
        {
          provide: getRepositoryToken(User),
          useValue: { ...mockRepository },
        },
      ],
    }).compile();

    seedService = module.get<SeedService>(SeedService);
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
    permissionRepository = module.get<Repository<Permission>>(getRepositoryToken(Permission));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('seedPermissions', () => {
    it('should insert new permissions if they do not exist', async () => {
      (permissionRepository.find as jest.Mock).mockResolvedValueOnce([]);
      (permissionRepository.insert as jest.Mock).mockResolvedValueOnce(undefined);

      await seedService['seedPermissions']();

      expect(permissionRepository.insert).toHaveBeenCalledWith(expect.any(Array));
    });

    it('should not insert permissions if they already exist', async () => {
      jest.spyOn(permissionRepository, 'find').mockResolvedValueOnce([
        { name: 'CREATE_EVENT' },
        { name: 'EDIT_EVENT' },
        { name: 'DELETE_EVENT' },
        { name: 'VIEW_EVENT' },
        { name: 'CREATE_TASK' },
        { name: 'EDIT_TASK' },
        { name: 'DELETE_TASK' },
        { name: 'VIEW_TASK' },
        { name: 'ASSIGN_TASK' },
        { name: 'MANAGE_USERS' },
      ] as Permission[]);
      
      const insertSpy = jest.spyOn(permissionRepository, 'insert');
      
      await seedService['seedPermissions']();
      
      expect(insertSpy).not.toHaveBeenCalled();
      
    });
  });

  describe('seedRoles', () => {
    it('should insert new roles if they do not exist', async () => {
      (permissionRepository.find as jest.Mock).mockResolvedValueOnce([
        { id: 1, name: 'CREATE_EVENT' } as Permission,
        { id: 2, name: 'EDIT_EVENT' } as Permission,
      ]);

      (roleRepository.find as jest.Mock).mockResolvedValueOnce([]);
      jest.spyOn(roleRepository, 'save').mockResolvedValueOnce(undefined);

      await seedService['seedRoles']();

      expect(roleRepository.save).toHaveBeenCalledWith(expect.any(Array));
    });

    it('should not insert roles if they already exist', async () => {
      jest.spyOn(roleRepository, 'find').mockResolvedValueOnce([
        { name: 'Admin', permissions: [{ id: 1, name: 'CREATE_EVENT' }, { id: 2, name: 'EDIT_EVENT' }] },
        { name: 'Event Manager', permissions: [{ id: 1, name: 'CREATE_EVENT' }] },
        { name: 'Task Manager', permissions: [] },
        { name: 'Viewer', permissions: [] },
      ] as Role[]);
      
      const saveSpy = jest.spyOn(roleRepository, 'save');
      
      await seedService['seedRoles']();
      
      expect(saveSpy).not.toHaveBeenCalled();
    });
  });

  describe('seedAdminUser', () => {
    it('should create a new admin user if one does not exist', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValueOnce(null);
      (roleRepository.findOne as jest.Mock).mockResolvedValueOnce({ name: 'Admin' } as Role);
      jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce('hashed_password');
      (userRepository.save as jest.Mock).mockResolvedValueOnce(undefined);

      await seedService['seedAdminUser']();

      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(userRepository.save).toHaveBeenCalledWith(expect.objectContaining({ email: 'testuser@yopmail.com' }));
    });

    it('should not create an admin user if one already exists', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValueOnce({ email: 'testuser@yopmail.com' } as User);

      await seedService['seedAdminUser']();

      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should log an error if admin role is missing', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValueOnce(null);
      (roleRepository.findOne as jest.Mock).mockResolvedValueOnce(null);

      const loggerSpy = jest.spyOn(seedService['logger'], 'error').mockImplementation();

      await seedService['seedAdminUser']();

      expect(loggerSpy).toHaveBeenCalledWith('Admin role not found! Ensure roles are seeded first.');
    });
  });
});
