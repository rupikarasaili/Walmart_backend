import { Controller, Get, UseGuards } from '@nestjs/common';
import { JWTAdminGuard } from '../auth/admin.guard';
import { AuditsService } from './audits.service';

@Controller('audits')
export class AuditsController {
  constructor(private readonly auditsService: AuditsService) {}

  @UseGuards(JWTAdminGuard)
  @Get()
  findAll() {
    return this.auditsService.findAll();
  }
}
