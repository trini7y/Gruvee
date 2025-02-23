import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Event } from '../../libs/entities/event.entity';
import { CreateEventDto, UpdateEventDto } from '../../libs/dto/event.dto';
import { User } from '../../libs/entities/users.entity';
import { NotFoundException } from '@nestjs/common';

const mockEventRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('EventService', () => {
  let service: EventService;
  let eventRepository: jest.Mocked<Repository<Event>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: getRepositoryToken(Event), useValue: mockEventRepository() },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
    eventRepository = module.get<Repository<Event>>(getRepositoryToken(Event)) as jest.Mocked<Repository<Event>>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an event', async () => {
    const createEventDto: CreateEventDto = {
      name: 'Sample Event',
      location: 'Venue A',
      start_time: new Date('2025-02-10T10:00:00Z'),
      end_time: new Date('2025-02-10T12:00:00Z'),
    };
    const user: User = { userId: 'user-id' } as User;
    const event = { id: 'event-id', ...createEventDto, created_by: user } as Event;

    eventRepository.create.mockReturnValue(event);
    eventRepository.save.mockResolvedValue(event);

    expect(await service.create(createEventDto, user)).toEqual(event);
  });

  it('should return all events', async () => {
    const events = [{ id: 'event-id', name: 'Sample Event' }] as Event[];
    eventRepository.find.mockResolvedValue(events);

    expect(await service.findAll()).toEqual(events);
  });

  it('should return an event by ID', async () => {
    const event = { id: 'event-id', name: 'Sample Event' } as Event;
    (eventRepository.findOne as jest.Mock).mockResolvedValue(event);

    expect(await service.findOne('event-id')).toEqual(event);
  });

  it('should throw NotFoundException if event is not found', async () => {
    eventRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne('event-id')).rejects.toThrow(NotFoundException);
  });

  it('should update an event', async () => {
    const updateEventDto: UpdateEventDto = {
      name: 'Updated Event',
      location: 'Updated Venue',
      start_time: new Date('2025-02-12T10:00:00Z'),
      end_time: new Date('2025-02-12T12:00:00Z'),
    };
    const event = { id: 'event-id', ...updateEventDto } as Event;

    jest.spyOn(service, 'findOne').mockResolvedValue(event);
    eventRepository.update.mockResolvedValue(undefined);

    expect(await service.update('event-id', updateEventDto)).toEqual(event);
  });

  it('should delete an event', async () => {
    const event = { id: 'event-id', name: 'Sample Event' } as Event;

    jest.spyOn(service, 'findOne').mockResolvedValue(event);
    eventRepository.remove.mockResolvedValue(undefined);

    await expect(service.remove('event-id')).resolves.toBeUndefined();
  });
});
