import { Module } from '@nestjs/common';
import { AuditsModule } from '../audits/audits.module';
import { JWTAdminGuard } from './admin.guard';
import { JWTGuard } from './auth.guard';
import { JWTStrategy } from './auth.strategy';

@Module({
  imports: [AuditsModule],
  providers: [JWTGuard, JWTAdminGuard, JWTStrategy],
})
export class AuthModule {}
