import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from '../../libs/entities/task.entity';
import { Event } from '../../libs/entities/event.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateTaskDto, UpdateTaskDto } from '../../libs/dto/task.dto';


describe('TaskService', () => {
  let service: TaskService;
  let taskRepository: Repository<Task>;
  let eventRepository: Repository<Event>;

  const mockTask = Object.assign(new Task(), {
    id: '1',
    title: 'Sample Task',
    description: 'Task Description',
    dueTime: new Date(),
    eventId: '123',
    event: {} as Event,
  });

  const mockEvent = Object.assign(new Event(), {
    id: '123',
    name: 'Sample Event',
    location: 'Test Location',
    startTime: new Date(),
    endTime: new Date(),
    userId: '456',
    user: {} as any,
    tasks: [],
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Event),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
    eventRepository = module.get<Repository<Event>>(getRepositoryToken(Event));
  });

  describe('create', () => {
    it('should create a new task', async () => {
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(mockEvent);
      jest.spyOn(taskRepository, 'create').mockReturnValue(mockTask);
      jest.spyOn(taskRepository, 'save').mockResolvedValue(mockTask);

      const createTaskDto = Object.assign(new CreateTaskDto(), {
        title: 'Sample Task',
        description: 'Task Description',
        dueTime: new Date(),
      });

      const result = await service.create(mockEvent.id, createTaskDto);

      expect(eventRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockEvent.id },
      });
      expect(taskRepository.create).toHaveBeenCalledWith({
        ...createTaskDto,
        eventId: mockEvent.id,
        event: mockEvent,
      });
      expect(taskRepository.save).toHaveBeenCalledWith(mockTask);
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if event does not exist', async () => {
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(null);

      const createTaskDto = Object.assign(new CreateTaskDto(), {
        title: 'Sample Task',
        description: 'Task Description',
        dueTime: new Date(),
      });

      await expect(service.create('invalid_id', createTaskDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all tasks for an event', async () => {
      jest.spyOn(taskRepository, 'find').mockResolvedValue([mockTask]);

      const result = await service.findAll(mockEvent.id);

      expect(taskRepository.find).toHaveBeenCalledWith({
        where: { eventId: mockEvent.id },
      });
      expect(result).toEqual([mockTask]);
    });
  });

  describe('findOne', () => {
    it('should return a task by ID', async () => {
      jest.spyOn(taskRepository, 'findOne').mockResolvedValue(mockTask);

      const result = await service.findOne(mockEvent.id, mockTask.id);

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTask.id, eventId: mockEvent.id },
      });
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task is not found', async () => {
      jest.spyOn(taskRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(mockEvent.id, 'invalid_id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockTask);
      jest.spyOn(taskRepository, 'save').mockResolvedValue(mockTask);

      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        description: 'Updated Description',
      };

      const result = await service.update(mockEvent.id, mockTask.id, updateTaskDto);

      expect(service.findOne).toHaveBeenCalledWith(mockEvent.id, mockTask.id);
      expect(taskRepository.save).toHaveBeenCalledWith({
        ...mockTask,
        ...updateTaskDto,
      });
      expect(result).toEqual(mockTask);
    });
  });

  describe('remove', () => {
    it('should delete a task', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockTask);
      jest.spyOn(taskRepository, 'remove').mockResolvedValue(mockTask);

      const result = await service.remove(mockEvent.id, mockTask.id);

      expect(service.findOne).toHaveBeenCalledWith(mockEvent.id, mockTask.id);
      expect(taskRepository.remove).toHaveBeenCalledWith(mockTask);
      expect(result).toEqual({ message: 'Task deleted successfully' });
    });
  });
});
