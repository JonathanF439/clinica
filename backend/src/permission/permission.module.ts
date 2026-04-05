import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { PermissionGuard } from '../auth/guards/permission.guard';

@Module({
  controllers: [PermissionController],
  providers: [PermissionService, PermissionGuard],
  exports: [PermissionGuard],
})
export class PermissionModule {}
