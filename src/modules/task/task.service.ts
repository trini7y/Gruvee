import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Task } from '../../libs/entities/task.entity';
import { Event } from '../../libs/entities/event.entity';
import { Member } from '../../libs/entities/member.entity';
import { CreateTaskDto, UpdateTaskDto } from '../../libs/dto/task.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  async create(eventId: string, createTaskDto: CreateTaskDto): Promise<Task> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });
    if (!event) throw new NotFoundException('Event not found');

    const members = await this.memberRepository.findBy({
      id: In(createTaskDto.assigned_to),
    });

    const task = this.taskRepository.create({
      ...createTaskDto,
      event,
      assigned_to: members,
    });

    return await this.taskRepository.save(task);
  }

  async findAll(eventId: string): Promise<Task[]> {
    return this.taskRepository.find({
      where: { event: { id: eventId } },
      relations: ['assigned_to'],
    });
  }

  async findOne(eventId: string, taskId: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId, event: { id: eventId } },
      relations: ['assigned_to'],
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(
    eventId: string,
    taskId: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    const task = await this.findOne(eventId, taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const assignedMembers = await this.memberRepository.findBy({
      id: In(updateTaskDto.assigned_to),
    });

    const updatedTask = {
      ...task,
      ...updateTaskDto,
      assigned_to: assignedMembers,
    };

    return this.taskRepository.save(updatedTask);
  }

  async remove(eventId: string, taskId: string): Promise<{ message: string }> {
    const task = await this.findOne(eventId, taskId);
    await this.taskRepository.remove(task);
    return { message: 'Task deleted successfully' };
  }
}
