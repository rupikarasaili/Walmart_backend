import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as dayjs from 'dayjs';
import { Repository } from 'typeorm';
import { ConfigurationService } from '../configuration/configuration.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserProfileDto } from './dto/update-user.dto';
import { Password } from './entities/password.entity';
import { User } from './entities/user.entity';
import { USER_TYPE } from './enums/user.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Password)
    private readonly passwordRepository: Repository<Password>,
    private readonly jwtService: JwtService,
    private readonly configurationService: ConfigurationService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const foundUser = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
      },
    });

    if (foundUser) {
      throw new BadRequestException('User already exists');
    }

    const user = await this.userRepository.save({
      email: createUserDto.email,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      phoneNumber: createUserDto.phoneNumber,
      type: createUserDto.type ?? USER_TYPE.BUYER,
    });

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      this.configurationService.bcryptRounds,
    );

    await this.passwordRepository.save({
      password: hashedPassword,
      user: user,
    });

    return user;
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async updateProfile(id: string, updateUserDto: UpdateUserProfileDto) {
    let user;
    try {
      user = await this.userRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!user) {
        throw new BadRequestException('Invalid User');
      }

      // email can't be updated
      const { password, email, ...updateUser } = updateUserDto;

      await this.userRepository.update(
        { id: id },
        {
          ...updateUser,
        },
      );

      if (password) {
        const passwords = await this.passwordRepository.find({
          where: {
            user: {
              id: id,
            },
          },
        });

        const matchPassword = passwords.find((_password) => {
          return bcrypt.compareSync(password, _password.password);
        });

        const hashedPassword = await bcrypt.hash(
          password,
          this.configurationService.bcryptRounds,
        );

        if (matchPassword) {
          throw new BadRequestException(
            'Cannot use the same or existing password twice',
          );
        }

        const currentActivePassword = passwords.find(
          (password) => password.isActive,
        );

        if (currentActivePassword) {
          await this.passwordRepository.update(
            { id: currentActivePassword.id },
            { isActive: false },
          );
        }

        await this.passwordRepository.save({
          user: user,
          isActive: true,
          password: hashedPassword,
        });
      }
    } catch (error) {
      throw new InternalServerErrorException(
        error.message ?? 'Failed to update',
      );
    }

    return await this.userRepository.findOne({
      where: {
        id: id,
      },
    });
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: loginUserDto.email,
      },
      relations: ['passwords'],
    });

    if (!user) {
      throw new BadRequestException('Invalid password or user does not exists');
    }

    // if brute-force detected, disabled login
    const alreadyCalled = await this.configurationService.redis.get(
      `${user.id}__disabled_login`,
    );

    if (alreadyCalled) {
      throw new BadRequestException('Too many login attempts, try again later');
    }

    const activePassword = user.passwords.find((password) => password.isActive);
    const isMatch = await bcrypt.compare(
      loginUserDto.password,
      activePassword.password,
    );

    const { passwords, ...withoutPasswords } = user;

    if (isMatch) {
      return {
        access_token: await this.jwtService.signAsync(withoutPasswords),
        requiresChange:
          dayjs().diff(dayjs(activePassword.createdAt), 'day') > 60,
        user: withoutPasswords,
      };
    } else {
      // Check if user has already requested in last 5 mins
      const alreadyCalled = await this.configurationService.redis.get(
        `${user.id}__hit`,
      );

      if (Number(alreadyCalled) >= 3) {
        // don't allow user to login anymore

        await this.configurationService.redis.setex(
          `${user.id}__disabled_login`,
          60 * 60 * 1, // disabled for 1 hour
          1,
        );

        throw new BadRequestException(
          'Invalid password or user does not exists',
        );
      }

      await this.configurationService.redis.setex(
        `${user.id}__hit`,
        60 * 5,
        alreadyCalled ? Number(alreadyCalled) + 1 : 1,
      );

      throw new BadRequestException('Invalid password or user does not exists');
    }
  }
}
