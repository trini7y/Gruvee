import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../libs/entities/users.entity';
import { RegistrationDto } from '../../libs/dto/registration.dto';
import { Request } from 'express';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

  ) {}
  
  private readonly log = new Logger(UserService.name);
  async createUser(payload: RegistrationDto, req: Request): Promise<object> {
    let response: object;
    try {
      if (!payload) {
        return { 
          status: 'Bad request',
          message: 'No payload provided',
          statusCode: 400 
        };
      }

      const authHeader = req.headers['authorization'];
      if (!authHeader) {
        throw new BadRequestException('No authorization header provided');
      }

      const [type, accessToken] = authHeader.split(' ');
      if (type !== 'Bearer' || !accessToken) {
        throw new BadRequestException('Invalid authorization header format');
      }

      const checkEmail = await this.isEmailTaken(payload.email);

      if (checkEmail) {
        response = {
          status: 'Bad request',
          message: 'Email has been taken',
          statusCode: 400,
        };
      } else {
        payload.password = await this.hashPassword(payload.password);
        const newUser = this.userRepository.create(payload);
        const savedUser = await this.userRepository.save(newUser);
        this.log.debug(`Saved User ${savedUser.email}`);

        response = {
          status: 'success',
          message: 'Registration successful',
          data: {
            accessToken: accessToken,
            user: {
              userId: savedUser.userId,
              firstName: savedUser.firstName,
              lastName: savedUser.lastName,
              email: savedUser.email,
            },
          },
        };
      }
      return response;
    } catch (error) {
      this.log.debug(`Something went wrong ${error}`);
      return {
        status: 'Bad request',
        message: 'Registration unsuccessful',
        statusCode: 400,
      };
    }
  }

  async getUserById(userId: string) {
    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    const data = {
      status: 'success',
      message: 'User data fetched successfully',
      data: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    };

    return data;
  }

  async isEmailTaken(email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { email } });
    return !!user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.roles', 'role')
    .where('user.email = :email', { email })
    .getOne();
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { userId: id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findUserWithRoles(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { userId: userId },
      relations: ['roles'],
    });
  }
}
