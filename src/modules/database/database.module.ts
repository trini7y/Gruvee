import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../../libs/entities/role.entity';
import { Permission } from '../../libs/entities/permission.entity';
import { SeedService } from './seed.service';
import { User } from 'src/libs/entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, User])],
  providers: [SeedService],
  exports: [SeedService],
})
export class DatabaseModule {}
