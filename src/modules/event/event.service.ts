import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../..//libs/entities/event.entity';
import { CreateEventDto, UpdateEventDto } from '../../libs/dto/event.dto';
import { User } from '../../libs/entities/users.entity';
import { validate as isUUID } from 'uuid';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async create(
    createEventDto: CreateEventDto,
    createdBy: User,
  ): Promise<Event> {
    const event = this.eventRepository.create({
      ...createEventDto,
      created_by: createdBy,
    });
    return this.eventRepository.save(event);
  }

  async findAll(): Promise<Event[]> {
    return this.eventRepository.find({
      relations: ['created_by', 'tasks', 'members'],
    });
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['created_by', 'tasks', 'members'],
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    await this.eventRepository.update(id, updateEventDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    
    const event = await this.findOne(id);
    console.log("Event",  event)
    if(!event){
      return { message: 'Event not found'}
    }
     const removeEvent = await this.eventRepository.remove(event);
     console.log("Remove",  removeEvent)
     if(removeEvent){
      return { message: 'Event deleted successfully' };
     }
  }
}
