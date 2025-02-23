import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { Event } from '../../libs/entities/event.entity';
import { User } from '../../libs/entities/users.entity';
import { Task } from '../../libs/entities/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event, User, Task])],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
