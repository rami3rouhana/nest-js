import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import AuthorizationError from 'src/errors/AuthorizationError';

@Injectable()
export class JwtRolesGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const rolesHandler = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    const classHandler = this.reflector.get<string[]>(
      'roles',
      context.getClass(),
    );

    // Extract and validate JWT
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthorizationError('Invalid authorization header');
    }
    const jwtToken = authHeader.split(' ')[1];
    let payload;
    try {
      payload = this.jwtService.verify(jwtToken);
    } catch (e) {
      throw new AuthorizationError('Invalid token');
    }

    request.user = payload;

    if (
      (rolesHandler || classHandler) &&
      (rolesHandler?.length > 0 || classHandler?.length > 0)
    ) {
      const role = request.user.role;
      if (!role) {
        throw new AuthorizationError('Role not found');
      }
      if (!(rolesHandler || classHandler).includes(role)) {
        throw new AuthorizationError('Insufficient role');
      }
    }

    return true;
  }
}
