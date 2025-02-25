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

@Controller('/members')
@UseGuards(AuthGuard)
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post()
  async create(
    @Body() createMemberDto: CreateMemberDto,
  ): Promise<Member> {
    return this.memberService.create(createMemberDto);
  }

  // @Get()
  // async findAll(@Param('eventId') email: string): Promise<Member[]> {
  //   return this.memberService.findAll(email);
  // }

  @Get(':memberId')
  async findOne(
    @Param('memberEmail') email: string,
  ): Promise<Member> {
    return this.memberService.findOne(email);
  }

  @Put(':memberId')
  async update(
    @Param('memberId') email: string,
    @Body() updateMemberDto: UpdateMemberDto,
  ): Promise<Member> {
    return this.memberService.update(email, updateMemberDto);
  }

  @Delete(':memberId')
  async remove(
    @Param('memberId') email: string,
  ): Promise<{ message: string }> {
    return this.memberService.remove(email);
  }
}
