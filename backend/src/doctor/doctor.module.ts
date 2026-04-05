import { Module } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { PermissionGuard } from '../auth/guards/permission.guard';

@Module({
  providers: [DoctorService, PermissionGuard],
  controllers: [DoctorController],
  exports: [DoctorService],
})
export class DoctorModule {}
