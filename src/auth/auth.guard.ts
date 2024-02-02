import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../configuration/constants';

@Injectable()
export class JWTGuard extends AuthGuard('JWT') {
  public constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {
    super();
  }

  public async canActivate(executionContext: ExecutionContext) {
    const contextHandler = executionContext.getHandler();
    const contextClass = executionContext.getClass();

    const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [
      contextHandler,
      contextClass,
    ]);

    if (isPublic) {
      return true;
    }

    const request = executionContext.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token is required');
    }

    try {

      const payload = await this.jwtService.verifyAsync(token);
      request['user'] = payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
