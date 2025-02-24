import { Test, TestingModule } from '@nestjs/testing';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { CreateMemberDto, UpdateMemberDto } from '../../libs/dto/member.dto';
import { Member } from '../../libs/entities/member.entity';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

describe('MemberController', () => {
  let memberController: MemberController;
  let memberService: MemberService;

  beforeEach(async () => {
    const mockAuthGuard = {
      canActivate: jest.fn().mockReturnValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemberController],
      providers: [
        {
          provide: MemberService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mocked-jwt-token'),
            verify: jest.fn(),
          },
        },
        Reflector,
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockAuthGuard)
      .compile();

    memberController = module.get<MemberController>(MemberController);
    memberService = module.get<MemberService>(MemberService);
  });

  it('should be defined', () => {
    expect(memberController).toBeDefined();
  });

  it('should create a member', async () => {
    const eventId = '1';
    const createMemberDto: CreateMemberDto = {
      name: 'John Doe',
      email: 'john@example.com',
    };
    const result = new Member();

    jest.spyOn(memberService, 'create').mockResolvedValue(result);
    expect(await memberController.create(eventId, createMemberDto)).toBe(result);
    expect(memberService.create).toHaveBeenCalledWith(eventId, createMemberDto);
  });

  it('should return all members for an event', async () => {
    const eventId = '1';
    const result = [new Member(), new Member()];

    jest.spyOn(memberService, 'findAll').mockResolvedValue(result);
    expect(await memberController.findAll(eventId)).toBe(result);
    expect(memberService.findAll).toHaveBeenCalledWith(eventId);
  });

  it('should return a single member', async () => {
    const eventId = '1';
    const memberId = 1;
    const result = new Member();

    jest.spyOn(memberService, 'findOne').mockResolvedValue(result);
    expect(await memberController.findOne(eventId, memberId)).toBe(result);
    expect(memberService.findOne).toHaveBeenCalledWith(eventId, memberId);
  });

  it('should update a member', async () => {
    const eventId = '1';
    const memberId = 1;
    const updateMemberDto: UpdateMemberDto = { name: 'Updated Name' };
    const result = new Member();

    jest.spyOn(memberService, 'update').mockResolvedValue(result);
    expect(await memberController.update(eventId, memberId, updateMemberDto)).toBe(result);
    expect(memberService.update).toHaveBeenCalledWith(eventId, memberId, updateMemberDto);
  });

  it('should remove a member', async () => {
    const eventId = '1';
    const memberId = 1;
    const result = { message: 'Member removed successfully' };

    jest.spyOn(memberService, 'remove').mockResolvedValue(result);
    expect(await memberController.remove(eventId, memberId)).toBe(result);
    expect(memberService.remove).toHaveBeenCalledWith(eventId, memberId);
  });
});
