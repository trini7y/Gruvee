import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '../../libs/entities/member.entity';
import { CreateMemberDto, UpdateMemberDto } from '../../libs/dto/member.dto';
import { Event } from '../../libs/entities/event.entity';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,

    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async create(
    eventId: string,
    createMemberDto: CreateMemberDto,
  ): Promise<Member> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });
    if (!event) throw new NotFoundException('Event not found');

    const member = this.memberRepository.create({
      ...createMemberDto,
      event,
    });

    return await this.memberRepository.save(member);
  }

  async findAll(eventId: string): Promise<Member[]> {
    return await this.memberRepository.find({
      where: { event: { id: eventId } },
    });
  }

  async findOne(eventId: string, memberId: number): Promise<Member> {
    const member = await this.memberRepository.findOne({
      where: { id: memberId, event: { id: eventId } },
    });
    if (!member) throw new NotFoundException('Member not found');
    return member;
  }

  async update(
    eventId: string,
    memberId: number,
    updateMemberDto: UpdateMemberDto,
  ): Promise<Member> {
    const member = await this.findOne(eventId, memberId);
    Object.assign(member, updateMemberDto);
    return await this.memberRepository.save(member);
  }

  async remove(
    eventId: string,
    memberId: number,
  ): Promise<{ message: string }> {
    const member = await this.findOne(eventId, memberId);
    await this.memberRepository.remove(member);
    return { message: 'Member removed successfully' };
  }
}
