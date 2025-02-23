import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from './config/data-source';
import { UserModule } from './modules/users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { RoleModule } from './modules/rolePermission/role.module';
import { DatabaseModule } from './modules/database/database.module';
import { EventModule } from './modules/event/event.module';
import { TaskModule } from './modules/task/task.module';
import { MemberModule } from './modules/member/member.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forRootAsync({
      useFactory: async () => ({
        type: 'postgres',
        host: (AppDataSource.options as any).host,
        port: (AppDataSource.options as any).port,
        username: (AppDataSource.options as any).username,
        password: (AppDataSource.options as any).password,
        database: (AppDataSource.options as any).database,
        entities: AppDataSource.options.entities,
        synchronize: AppDataSource.options.synchronize,
        migrationsTableName: 'migration',
        migrations: ['src/migration/*.ts'],
        logging: AppDataSource.options.logging,
      }),
    }),

    UserModule,
    AuthModule,
    RoleModule,
    DatabaseModule,
    EventModule,
    TaskModule,
    MemberModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
