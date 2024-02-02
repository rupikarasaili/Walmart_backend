import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Audit } from './entities/audit.entity';

@Injectable()
export class AuditsService {
  constructor(
    @InjectRepository(Audit)
    private readonly auditRepository: Repository<Audit>,
  ) {}

  async create(entity: string, description: string) {
    return await this.auditRepository.save({
      entity,
      description,
    });
  }

  async findAll() {
    return await this.auditRepository.find();
  }
}
