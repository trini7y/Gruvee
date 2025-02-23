import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../../libs/entities/task.entity';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { Event } from '../../libs/entities/event.entity';
import { Member } from '../../libs/entities/member.entity';
import { MemberModule } from '../member/member.module';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Event, Member]), MemberModule],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
