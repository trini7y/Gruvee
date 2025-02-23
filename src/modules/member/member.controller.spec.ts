import { Test, TestingModule } from '@nestjs/testing';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { CreateMemberDto, UpdateMemberDto } from '../../libs/dto/member.dto';
import { Member } from '../../libs/entities/member.entity';

describe('MemberController', () => {
  let memberController: MemberController;
  let memberService: MemberService;

  beforeEach(async () => {
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
      ],
    }).compile();

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
    expect(await memberController.create(eventId, createMemberDto)).toBe(
      result,
    );
  });

  it('should return all members for an event', async () => {
    const eventId = '1';
    const result = [new Member(), new Member()];

    jest.spyOn(memberService, 'findAll').mockResolvedValue(result);
    expect(await memberController.findAll(eventId)).toBe(result);
  });

  it('should return a single member', async () => {
    const eventId = '1';
    const memberId = 1;
    const result = new Member();

    jest.spyOn(memberService, 'findOne').mockResolvedValue(result);
    expect(await memberController.findOne(eventId, memberId)).toBe(result);
  });

  it('should update a member', async () => {
    const eventId = '1';
    const memberId = 1;
    const updateMemberDto: UpdateMemberDto = { name: 'Updated Name' };
    const result = new Member();

    jest.spyOn(memberService, 'update').mockResolvedValue(result);
    expect(
      await memberController.update(eventId, memberId, updateMemberDto),
    ).toBe(result);
  });

  it('should remove a member', async () => {
    const eventId = '1';
    const memberId = 1;
    const result = { message: 'Member removed successfully' };

    jest.spyOn(memberService, 'remove').mockResolvedValue(result);
    expect(await memberController.remove(eventId, memberId)).toBe(result);
  });
});
