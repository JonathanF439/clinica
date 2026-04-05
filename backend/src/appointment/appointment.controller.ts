import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@ApiTags('Appointments')
@Controller('appointments')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get()
  @RequirePermission('appointment', 'read')
  @ApiOperation({ summary: 'Listar agendamentos por data e/ou médico' })
  @ApiQuery({ name: 'date', required: false })
  @ApiQuery({ name: 'doctorId', required: false })
  findByDate(
    @Query('date') date?: string,
    @Query('doctorId') doctorId?: string,
    @Request() req?: { user: { id: string; role: string } },
  ) {
    return this.appointmentService.findByDate(date, doctorId, req?.user);
  }

  // IMPORTANT: This route must be declared BEFORE :id to prevent NestJS
  // from matching "patient" as the :id param
  @Get('patient/:patientId')
  @RequirePermission('appointment', 'read')
  @ApiOperation({ summary: 'Listar agendamentos de um paciente' })
  findByPatient(@Param('patientId') patientId: string) {
    return this.appointmentService.findByPatient(patientId);
  }

  @Get(':id')
  @RequirePermission('appointment', 'read')
  @ApiOperation({ summary: 'Buscar agendamento por ID' })
  findById(@Param('id') id: string) {
    return this.appointmentService.findById(id);
  }

  @Post()
  @RequirePermission('appointment', 'create')
  @ApiOperation({ summary: 'Criar agendamento' })
  create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentService.create(dto);
  }

  @Patch(':id/status')
  @RequirePermission('appointment', 'change_status')
  @ApiOperation({ summary: 'Atualizar status do agendamento' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.appointmentService.updateStatus(id, status);
  }

  @Patch(':id')
  @RequirePermission('appointment', 'update')
  @ApiOperation({ summary: 'Atualizar agendamento' })
  update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    return this.appointmentService.update(id, dto);
  }
}
