import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { CreateEventDto, UpdateEventDto } from '../../libs/dto/event.dto';
import { User } from '../../libs/entities/users.entity';
import { Request } from 'express';

describe('EventController', () => {
  let eventController: EventController;
  let eventService: EventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        {
          provide: EventService,
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

    eventController = module.get<EventController>(EventController);
    eventService = module.get<EventService>(EventService);
  });

  it('should be defined', () => {
    expect(eventController).toBeDefined();
  });

  it('should create an event', async () => {
    const createEventDto: CreateEventDto = {
      name: 'Sample Event',
      location: 'Venue A',
      start_time: new Date('2025-02-10T10:00:00Z'),
      end_time: new Date('2025-02-10T12:00:00Z'),
    };
    const user: User = { userId: 'user-id' } as User;
    const req = { user } as unknown as Request;
    const result = { id: 'event-id', ...createEventDto };

    jest.spyOn(eventService, 'create').mockResolvedValue(result);
    expect(await eventController.create(createEventDto, req)).toBe(result);
  });

  it('should return all events', async () => {
    const result = [{ id: 'event-id', name: 'Sample Event' }];
    jest.spyOn(eventService, 'findAll').mockResolvedValue(result);
    expect(await eventController.findAll()).toBe(result);
  });

  it('should return a single event', async () => {
    const result = { id: 'event-id', name: 'Sample Event' };
    jest.spyOn(eventService, 'findOne').mockResolvedValue(result);
    expect(await eventController.findOne('event-id')).toBe(result);
  });

  it('should update an event', async () => {
    const updateEventDto: UpdateEventDto = {
      name: 'Updated Event',
      location: 'Updated Venue',
      start_time: new Date('2025-02-12T10:00:00Z'),
      end_time: new Date('2025-02-12T12:00:00Z'),
    };
    const result = { id: 'event-id', ...updateEventDto };

    jest.spyOn(eventService, 'update').mockResolvedValue(result);
    expect(await eventController.update('event-id', updateEventDto)).toBe(result);
  });

  it('should delete an event', async () => {
    jest.spyOn(eventService, 'remove').mockResolvedValue(undefined);
    expect(await eventController.remove('event-id')).toEqual({ message: 'Event deleted successfully' });
  });
});
