import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { PermissionGuard } from '../auth/guards/permission.guard';

@Module({
  providers: [AppointmentService, PermissionGuard],
  controllers: [AppointmentController],
})
export class AppointmentModule {}
