import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DoctorModule } from './doctor/doctor.module';
import { PatientModule } from './patient/patient.module';
import { AppointmentModule } from './appointment/appointment.module';
import { ProcedureModule } from './procedure/procedure.module';
import { PermissionModule } from './permission/permission.module';
import { AppointmentStatusModule } from './appointment-status/appointment-status.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    DoctorModule,
    PatientModule,
    AppointmentModule,
    ProcedureModule,
    PermissionModule,
    AppointmentStatusModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
