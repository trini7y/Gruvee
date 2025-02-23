import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from '../../libs/entities/member.entity';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { Event } from '../../libs/entities/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Member, Event])],
  controllers: [MemberController],
  providers: [MemberService],
  exports: [MemberService],
})
export class MemberModule {}
