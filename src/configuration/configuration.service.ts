import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';

@Injectable()
export class ConfigurationService {
  constructor(private readonly configService: ConfigService) {}
  get redis(): IORedis {
    const redis = new IORedis({
      host: this.configService.get<string>('REDIS_USERNAME'),
      port: this.configService.get<number>('REDIS_PORT'),
      password: this.configService.get('REDIS_PASSWORD'),
    } as any) as any;

    return redis;
  }

  get encryptedKey(): string {
    return this.configService.get<string>('ENCRYPT_KEY');
  }

  get mailgunCreds(): Record<string, string> {
    return {
      username: this.configService.get<string>('MAILGUN_USERNAME'),
      key: this.configService.get<string>('MAILGUN_KEY'),
      from: this.configService.get<string>('MAILGUN_FROM'),
    };
  }

  get bcryptRounds() {
    return Number(this.configService.get<number>('BCRYPT_ROUNDS'));
  }
}
