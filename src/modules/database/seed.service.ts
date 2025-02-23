import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from '../../libs/entities/role.entity';
import { Permission } from '../../libs/entities/permission.entity';
import { User } from '../../libs/entities/users.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission) private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedPermissions();
    await this.seedRoles();
    await this.seedAdminUser();
  }

  private async seedPermissions() {
    const permissions = [
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
    ];

    const existingPermissions = await this.permissionRepository.find({
      where: { name: In(permissions.map((p) => p.name)) },
    });

    const existingPermissionNames = existingPermissions.map((p) => p.name);
    const newPermissions = permissions.filter((p) => !existingPermissionNames.includes(p.name));

    if (newPermissions.length > 0) {
      await this.permissionRepository.insert(newPermissions);
    }
  }

  private async seedRoles() {
    const permissions = await this.permissionRepository.find();

    const roles = [
      {
        name: 'Admin',
        permissions: permissions,
      },
      {
        name: 'Event Manager',
        permissions: permissions.filter((p) =>
          ['CREATE_EVENT', 'EDIT_EVENT', 'DELETE_EVENT', 'VIEW_EVENT', 'CREATE_TASK', 'EDIT_TASK', 'DELETE_TASK', 'VIEW_TASK'].includes(p.name),
        ),
      },
      {
        name: 'Task Manager',
        permissions: permissions.filter((p) =>
          ['CREATE_TASK', 'EDIT_TASK', 'DELETE_TASK', 'VIEW_TASK', 'ASSIGN_TASK'].includes(p.name),
        ),
      },
      {
        name: 'Viewer',
        permissions: permissions.filter((p) =>
          ['VIEW_EVENT', 'VIEW_TASK'].includes(p.name),
        ),
      },
    ];

    const existingRoles = await this.roleRepository.find({
      where: { name: In(roles.map((r) => r.name)) },
    });

    const existingRoleNames = existingRoles.map((r) => r.name);
    const newRoles = roles.filter((r) => !existingRoleNames.includes(r.name));

    if (newRoles.length > 0) {
      await this.roleRepository.save(newRoles);
    }
  }

  private async seedAdminUser() {
    const firstName = 'John';
    const lastName = 'Doe';
    const adminEmail = 'testuser@yopmail.com';
    const adminPassword = 'password';

    const existingAdmin = await this.userRepository.findOne({
      where: { email: adminEmail },
      relations: ['roles'],
    });

    if (existingAdmin) {
      this.logger.log(`Admin user already exists: ${existingAdmin.email}`);
      return;
    }

    const adminRole = await this.roleRepository.findOne({ where: { name: 'Admin' } });

    if (!adminRole) {
      this.logger.error('Admin role not found! Ensure roles are seeded first.');
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminUser = this.userRepository.create({
      firstName: firstName,
      lastName: lastName,
      email: adminEmail,
      password: hashedPassword,
      roles: [adminRole],
    });

    await this.userRepository.save(adminUser);

    this.logger.log('Default admin user created successfully!');
    this.logger.log(`Email: ${adminEmail}`);
    this.logger.log(`Password: ${adminPassword}`);
  }
}
