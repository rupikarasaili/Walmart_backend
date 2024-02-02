import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JWTGuard } from '../auth/auth.guard';
import { Password } from './entities/password.entity';
import { PaymentMethod } from './entities/payment.entity';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Password, PaymentMethod])],
  controllers: [UsersController],
  providers: [UsersService, JWTGuard],
  exports: [TypeOrmModule],
})
export class UsersModule {}
