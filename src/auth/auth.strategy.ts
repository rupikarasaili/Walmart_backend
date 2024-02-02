import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy, 'JWT') {
  public constructor(private readonly jwtService: JwtService) {
    super();
  }

  public async validate(token: string): Promise<void> {
    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }

    const isValid = this.jwtService.verifyAsync(token);
    if (isValid) {
      return this.jwtService.decode(token);
    }
  }
}
