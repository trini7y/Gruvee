import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto } from '../../libs/dto/task.dto';
import { Task } from '../../libs/entities/task.entity';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

describe('TaskController', () => {
  let taskController: TaskController;
  let taskService: TaskService;

  beforeEach(async () => {
    const mockAuthGuard = {
      canActivate: jest.fn().mockReturnValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mocked-jwt-token'),
            verify: jest.fn(),
          },
        },
        Reflector,
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockAuthGuard)
      .compile();

    taskController = module.get<TaskController>(TaskController);
    taskService = module.get<TaskService>(TaskService);
  });

  it('should create a task', async () => {
    const eventId = 'event-id';
    const createTaskDto: CreateTaskDto = {
      title: 'Task 1',
      description: 'Description',
      assigned_to: [1, 2],
      due_time: '2025-02-10T11:00:00Z',
    };

    const result = new Task();
    jest.spyOn(taskService, 'create').mockResolvedValue(result);

    expect(await taskController.create(eventId, createTaskDto)).toBe(result);
    expect(taskService.create).toHaveBeenCalledWith(eventId, createTaskDto);
  });

  it('should return all tasks for an event', async () => {
    const eventId = 'event-id';
    const result = [new Task()];
    jest.spyOn(taskService, 'findAll').mockResolvedValue(result);

    expect(await taskController.findAll(eventId)).toBe(result);
    expect(taskService.findAll).toHaveBeenCalledWith(eventId);
  });
});
