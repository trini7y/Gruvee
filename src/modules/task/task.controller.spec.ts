import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto } from '../../libs/dto/task.dto';
import { Task } from '../../libs/entities/task.entity';

describe('TaskController', () => {
  let taskController: TaskController;
  let taskService: TaskService;

  beforeEach(async () => {
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
      ],
    }).compile();

    taskController = module.get<TaskController>(TaskController);
    taskService = module.get<TaskService>(TaskService);
  });

  it('should create a task', async () => {
    const eventId = 'event-id';
    const createTaskDto: CreateTaskDto = { title: 'Task 1', description: 'Description', assigned_to: [1, 2], due_time: '2025-02-10T11:00:00Z' };
    const result = new Task();
    jest.spyOn(taskService, 'create').mockResolvedValue(result);
    expect(await taskController.create(eventId, createTaskDto)).toBe(result);
  });

  it('should return all tasks for an event', async () => {
    const eventId = 'event-id';
    const result = [new Task()];
    jest.spyOn(taskService, 'findAll').mockResolvedValue(result);
    expect(await taskController.findAll(eventId)).toBe(result);
  });
});
