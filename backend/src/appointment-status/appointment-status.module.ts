import { Module } from '@nestjs/common';
import { AppointmentStatusService } from './appointment-status.service';
import { AppointmentStatusController } from './appointment-status.controller';

@Module({
  providers: [AppointmentStatusService],
  controllers: [AppointmentStatusController],
})
export class AppointmentStatusModule {}
