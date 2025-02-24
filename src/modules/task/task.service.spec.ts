import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { In, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from '../../libs/entities/task.entity';
import { Event } from '../../libs/entities/event.entity';
import { Member } from '../../libs/entities/member.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateTaskDto, UpdateTaskDto } from '../../libs/dto/task.dto';

describe('TaskService', () => {
  let taskService: TaskService;
  let taskRepository: Repository<Task>;
  let eventRepository: Repository<Event>;
  let memberRepository: Repository<Member>;

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
        {
          provide: getRepositoryToken(Member),
          useClass: Repository,
        },
      ],
    }).compile();

    taskService = module.get<TaskService>(TaskService);
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
    eventRepository = module.get<Repository<Event>>(getRepositoryToken(Event));
    memberRepository = module.get<Repository<Member>>(getRepositoryToken(Member));
  });

  describe('create', () => {
    it('should create and return a task', async () => {
      const eventId = 'event123';
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        description: 'This is a test task',
        due_time: new Date().toISOString(),
        assigned_to: [1, 2],
      };

      const mockEvent = { id: eventId } as Event;
      const mockMembers = [
        { id: 1, name: 'Member 1', email: 'member1@example.com', event: null },
        { id: 2, name: 'Member 2', email: 'member2@example.com', event: null }
      ] as Member[];
      const mockTask = { id: 'task1', ...createTaskDto, event: mockEvent, assigned_to: mockMembers, due_time: new Date(createTaskDto.due_time) } as Task;

      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(mockEvent);
      jest.spyOn(memberRepository, 'findBy').mockResolvedValue(mockMembers);
      jest.spyOn(taskRepository, 'create').mockReturnValue(mockTask);
      jest.spyOn(taskRepository, 'save').mockResolvedValue(mockTask);

      const result = await taskService.create(eventId, createTaskDto);
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if event is not found', async () => {
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(null);

      await expect(taskService.create('invalidEventId', { title: 'Task', description: 'Desc', due_time: new Date().toISOString(), assigned_to: [] }))
        .rejects.toThrow(new NotFoundException('Event not found'));
    });
  });

  describe('findAll', () => {
    it('should return all tasks for an event', async () => {
      const eventId = 'event123';
      const mockTasks = [
        { id: 'task1', title: 'Task 1' } as Task,
        { id: 'task2', title: 'Task 2' } as Task,
      ];

      jest.spyOn(taskRepository, 'find').mockResolvedValue(mockTasks);

      const result = await taskService.findAll(eventId);
      expect(result).toEqual(mockTasks);
    });
  });

  describe('findOne', () => {
    it('should return a task by ID', async () => {
      const eventId = 'event123';
      const taskId = 'task1';
      const mockTask = { id: taskId, title: 'Test Task' } as Task;

      jest.spyOn(taskRepository, 'findOne').mockResolvedValue(mockTask);

      const result = await taskService.findOne(eventId, taskId);
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task is not found', async () => {
      jest.spyOn(taskRepository, 'findOne').mockResolvedValue(null);

      await expect(taskService.findOne('event123', 'invalidTaskId'))
        .rejects.toThrow(new NotFoundException('Task not found'));
    });
  });

  describe('update', () => {
    it('should update and return a task', async () => {
      const eventId = 'event123';
      const taskId = 'task1';
  
      const updateTaskDto: UpdateTaskDto = { 
        title: 'Updated Task',
        due_time: '2025-03-01T10:00:00Z',
        assigned_to: [1, 2], 
      };
  
      const existingTask = {
        id: taskId,
        title: 'Old Task',
        description: 'Old Description',
        due_time: new Date('2025-02-28T10:00:00Z'),
        event: { id: eventId } as Event,
        assigned_to: [],
      } as Task;
  
      const assignedMembers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', event: null } as Member,
        { id: 2, name: 'Jane Doe', email: 'jane@example.com', event: null } as Member,
      ];
  
      const updatedTask = {
        ...existingTask,
        ...updateTaskDto,
        due_time: new Date(updateTaskDto.due_time),
        assigned_to: assignedMembers,
      };
  
      jest.spyOn(taskService, 'findOne').mockResolvedValueOnce(existingTask);
      jest.spyOn(memberRepository, 'findBy').mockResolvedValueOnce(assignedMembers);
      jest.spyOn(taskRepository, 'save').mockResolvedValueOnce(updatedTask);
  
      const result = await taskService.update(eventId, taskId, updateTaskDto);
  
      expect(result).toEqual(updatedTask);
      expect(taskService.findOne).toHaveBeenCalledWith(eventId, taskId);
      expect(memberRepository.findBy).toHaveBeenCalledWith({ id: In(updateTaskDto.assigned_to) });
      expect(taskRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        id: taskId,
        title: 'Updated Task',
        due_time: expect.any(Date),
        assigned_to: expect.arrayContaining([
          expect.objectContaining({ id: 1 }),
          expect.objectContaining({ id: 2 }),
        ]),
      }));
    });
  
    
      it('should throw NotFoundException if task does not exist', async () => {
        jest.spyOn(taskService, 'findOne').mockRejectedValueOnce(new NotFoundException('Task not found'));
    
        await expect(taskService.update('event123', 'invalidTaskId', { title: 'Updated' }))
          .rejects.toThrow(new NotFoundException('Task not found'));
      });
    });

  describe('remove', () => {
    it('should delete a task and return a success message', async () => {
      const eventId = 'event123';
      const taskId = 'task1';
      const existingTask = { id: taskId, title: 'Task to delete' } as Task;

      jest.spyOn(taskService, 'findOne').mockResolvedValue(existingTask);
      jest.spyOn(taskRepository, 'remove').mockResolvedValue(existingTask);

      const result = await taskService.remove(eventId, taskId);
      expect(result).toEqual({ message: 'Task deleted successfully' });
    });

    it('should throw NotFoundException if task does not exist', async () => {
      jest.spyOn(taskService, 'findOne').mockRejectedValue(new NotFoundException('Task not found'));

      await expect(taskService.remove('event123', 'invalidTaskId'))
        .rejects.toThrow(new NotFoundException('Task not found'));
    });
  });
});
