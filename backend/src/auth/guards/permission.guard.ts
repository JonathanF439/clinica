import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.getAllAndOverride<{ resource: string; action: string }>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!permission) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    // ADMIN is always allowed — not stored in permissions table
    if (user.role === 'ADMIN') return true;

    const record = await this.prisma.permission.findUnique({
      where: {
        role_resource_action: {
          role: user.role,
          resource: permission.resource,
          action: permission.action,
        },
      },
    });

    if (!record || !record.allowed) {
      throw new ForbiddenException('Acesso negado');
    }

    return true;
  }
}
