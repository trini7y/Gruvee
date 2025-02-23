import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { CreateMemberDto, UpdateMemberDto } from '../../libs/dto/member.dto';
import { AuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Member } from '../../libs/entities/member.entity';

@Controller('events/:eventId/members')
@UseGuards(AuthGuard)
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post()
  async create(
    @Param('eventId') eventId: string,
    @Body() createMemberDto: CreateMemberDto,
  ): Promise<Member> {
    return this.memberService.create(eventId, createMemberDto);
  }

  @Get()
  async findAll(@Param('eventId') eventId: string): Promise<Member[]> {
    return this.memberService.findAll(eventId);
  }

  @Get(':memberId')
  async findOne(
    @Param('eventId') eventId: string,
    @Param('memberId') memberId: number,
  ): Promise<Member> {
    return this.memberService.findOne(eventId, memberId);
  }

  @Put(':memberId')
  async update(
    @Param('eventId') eventId: string,
    @Param('memberId') memberId: number,
    @Body() updateMemberDto: UpdateMemberDto,
  ): Promise<Member> {
    return this.memberService.update(eventId, memberId, updateMemberDto);
  }

  @Delete(':memberId')
  async remove(
    @Param('eventId') eventId: string,
    @Param('memberId') memberId: number,
  ): Promise<{ message: string }> {
    return this.memberService.remove(eventId, memberId);
  }
}
