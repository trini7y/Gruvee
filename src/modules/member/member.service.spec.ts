import { Test, TestingModule } from '@nestjs/testing';
import { MemberService } from './member.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Member } from '../../libs/entities/member.entity';
import { Event } from '../../libs/entities/event.entity';
import { CreateMemberDto } from '../../libs/dto/create-member.dto';
import { NotFoundException } from '@nestjs/common';

describe('MemberService', () => {
  let service: MemberService;
  let memberRepository: Repository<Member>;
  let eventRepository: Repository<Event>;

  const mockEvent = { id: 'event-1', name: 'Test Event' } as Event;
  const mockMembers = [
    { id: 1, name: 'Member 1', email: 'member1@test.com', event: mockEvent },
    { id: 2, name: 'Member 2', email: 'member2@test.com', event: mockEvent },
  ] as Member[];

  const mockMemberRepository = {
    create: jest.fn().mockImplementation((dto) => ({ id: 1, ...dto })),
    save: jest.fn().mockImplementation((member) => Promise.resolve(member)),
    find: jest.fn().mockResolvedValue(mockMembers),
    findOne: jest.fn(({ where }) => {
      const foundMember = mockMembers.find(
        (m) => m.id === where.id && m.event.id === where.event.id,
      );
      return Promise.resolve(foundMember || null);
    }),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  const mockEventRepository = {
    findOne: jest.fn().mockImplementation(({ where }) => {
      return where.id === mockEvent.id ? Promise.resolve(mockEvent) : null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemberService,
        { provide: getRepositoryToken(Member), useValue: mockMemberRepository },
        { provide: getRepositoryToken(Event), useValue: mockEventRepository },
      ],
    }).compile();

    service = module.get<MemberService>(MemberService);
    memberRepository = module.get<Repository<Member>>(
      getRepositoryToken(Member),
    );
    eventRepository = module.get<Repository<Event>>(getRepositoryToken(Event));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a new member', async () => {
      const createMemberDto: CreateMemberDto = {
        name: 'New Member',
        email: 'newmember@test.com',
      };

      const result = await service.create(mockEvent.id, createMemberDto);

      expect(result).toEqual({ id: 1, ...createMemberDto, event: mockEvent });
      expect(eventRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockEvent.id },
      });
      expect(memberRepository.create).toHaveBeenCalledWith({
        ...createMemberDto,
        event: mockEvent,
      });
      expect(memberRepository.save).toHaveBeenCalledWith({
        id: 1,
        ...createMemberDto,
        event: mockEvent,
      });
    });

    it('should throw NotFoundException if event does not exist', async () => {
      await expect(
        service.create('invalid-event', {
          name: 'New Member',
          email: 'test@test.com',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all members of an event', async () => {
      const result = await service.findAll(mockEvent.id);
      expect(result).toEqual(mockMembers);
      expect(memberRepository.find).toHaveBeenCalledWith({
        where: { event: { id: mockEvent.id } },
      });
    });
  });

  describe('findOne', () => {
    it('should return a single member of an event', async () => {
      const result = await service.findOne(mockEvent.id, 1);
      expect(result).toEqual(mockMembers[0]);
      expect(memberRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, event: { id: mockEvent.id } },
      });
    });

    it('should throw NotFoundException if member is not found', async () => {
      await expect(service.findOne(mockEvent.id, 999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a member from an event', async () => {
      const result = await service.remove(mockEvent.id, 1);
      expect(result).toEqual({ message: 'Member removed successfully' });
      expect(memberRepository.remove).toHaveBeenCalledWith(mockMembers[0]);
    });

    it('should throw NotFoundException if member is not found', async () => {
      await expect(service.remove(mockEvent.id, 999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
