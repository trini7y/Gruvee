import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from '../../libs/dto/create-role.dto';
import { CreatePermissionDto } from '../../libs/dto/create-permission.dto';
import { AuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('roles-permission')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @UseGuards(AuthGuard)
  @Roles('Admin')
  @Post('/create-role')
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.createRole(createRoleDto);
  }

  @UseGuards(AuthGuard)
  @Get('/get-roles')
  async getAllRoles() {
    return this.roleService.findAllRoles();
  }

  @UseGuards(AuthGuard)
  @Roles('Admin')
  @Post('/create-permission')
  async createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.roleService.createPermission(createPermissionDto);
  }

  @UseGuards(AuthGuard)
  @Get('/get-permission')
  async getAllPermissions() {
    return this.roleService.findAllPermissions();
  }
}
