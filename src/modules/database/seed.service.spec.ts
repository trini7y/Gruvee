import { Test, TestingModule } from '@nestjs/testing';
import { SeedService } from './seed.service';
import { Repository } from 'typeorm';
import { Role } from '../../libs/entities/role.entity';
import { Permission } from '../../libs/entities/permission.entity';
import { User } from '../../libs/entities/users.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Logger } from '@nestjs/common';


describe('SeedService', () => {
  let service: SeedService;
  let roleRepository: Repository<Role>;
  let permissionRepository: Repository<Permission>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        {
          provide: getRepositoryToken(Role),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Permission),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        Logger,
      ],
    }).compile();

    service = module.get<SeedService>(SeedService);
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
    permissionRepository = module.get<Repository<Permission>>(getRepositoryToken(Permission));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('seedPermissions', () => {
    it('should insert new permissions if they do not exist', async () => {
      jest.spyOn(permissionRepository, 'find').mockResolvedValue([]);
      jest.spyOn(permissionRepository, 'insert').mockResolvedValue(undefined);

      await service['seedPermissions']();

      expect(permissionRepository.insert).toHaveBeenCalled();
    });
  });

  describe('seedRoles', () => {
    it('should create roles with proper permissions', async () => {
      jest.spyOn(permissionRepository, 'find').mockResolvedValue([
        { name: 'CREATE_EVENT' } as Permission,
        { name: 'VIEW_EVENT' } as Permission,
      ]);
      jest.spyOn(roleRepository, 'find').mockResolvedValue([]);
      jest.spyOn(roleRepository, 'save').mockResolvedValue([]);

      await service['seedRoles']();

      expect(roleRepository.save).toHaveBeenCalled();
    });
  });

  describe('seedAdminUser', () => {
    it('should create an admin user if one does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue({ name: 'Admin' } as Role);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed_password');
      jest.spyOn(userRepository, 'create').mockReturnValue({} as User);
      jest.spyOn(userRepository, 'save').mockResolvedValue({} as User);

      await service['seedAdminUser']();

      expect(userRepository.save).toHaveBeenCalled();
    });
  });
});
