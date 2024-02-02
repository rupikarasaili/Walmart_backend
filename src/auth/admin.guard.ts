import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuditsService } from '../audits/audits.service';
import { IS_PUBLIC_KEY } from '../configuration/constants';

@Injectable()
export class JWTAdminGuard extends AuthGuard('JWT') {
  public constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditsService,
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
      if (!payload.isAdmin) {
        await this.auditService.create(
          'USER',
          `User with email ${payload.email} tried to access admin dashboard`,
        );

        throw new UnauthorizedException(
          'Must be an admin to perform this action',
        );
      }

      request['user'] = payload;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException(error.message ?? 'Invalid token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
