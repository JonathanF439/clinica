import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.permission.findMany({
      orderBy: [{ role: 'asc' }, { resource: 'asc' }, { action: 'asc' }],
    });
  }

  upsert(role: UserRole, resource: string, action: string, allowed: boolean) {
    return this.prisma.permission.upsert({
      where: { role_resource_action: { role, resource, action } },
      update: { allowed },
      create: { role, resource, action, allowed },
    });
  }
}
