import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto } from '../../libs/dto/task.dto';
import { AuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Task } from '../../libs/entities/task.entity';

@Controller('events/:eventId/tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Param('eventId') eventId: string,
    @Body() createTaskDto: CreateTaskDto,
  ): Promise<Task> {
    return this.taskService.create(eventId, createTaskDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  async findAll(@Param('eventId') eventId: string): Promise<Task[]> {
    return this.taskService.findAll(eventId);
  }

  @UseGuards(AuthGuard)
  @Get(':taskId')
  async findOne(
    @Param('eventId') eventId: string,
    @Param('taskId') taskId: string,
  ): Promise<Task> {
    return this.taskService.findOne(eventId, taskId);
  }

  @UseGuards(AuthGuard)
  @Put(':taskId')
  async update(
    @Param('eventId') eventId: string,
    @Param('taskId') taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    return this.taskService.update(eventId, taskId, updateTaskDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':taskId')
  async remove(
    @Param('eventId') eventId: string,
    @Param('taskId') taskId: string,
  ): Promise<{ message: string }> {
    return this.taskService.remove(eventId, taskId);
  }
}
