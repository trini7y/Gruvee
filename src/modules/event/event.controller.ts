import { Controller, Post, Get, Put, Delete, Param, Body, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto, UpdateEventDto } from '../../libs/dto/event.dto';
import { AuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { User } from '../../libs/entities/users.entity';
import { isUUID } from 'class-validator';

@Controller('events')
@UseGuards(AuthGuard)
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  async create(@Body() createEventDto: CreateEventDto, @Req() req: Request) {
    const user = req.user as User;
    return this.eventService.create(createEventDto, user);
  }

  @Get()
  async findAll() {
    return this.eventService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.eventService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventService.update(id, updateEventDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }
   return await this.eventService.remove(id)
  }
}