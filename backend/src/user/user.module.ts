import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PermissionGuard } from '../auth/guards/permission.guard';

@Module({
  providers: [UserService, PermissionGuard],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
