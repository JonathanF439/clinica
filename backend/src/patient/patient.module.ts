import { Module } from '@nestjs/common';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { PermissionGuard } from '../auth/guards/permission.guard';

@Module({
  providers: [PatientService, PermissionGuard],
  controllers: [PatientController],
  exports: [PatientService],
})
export class PatientModule {}
