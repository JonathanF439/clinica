import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppointmentStatusService } from './appointment-status.service';
import { CreateAppointmentStatusDto } from './dto/create-appointment-status.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('AppointmentStatuses')
@Controller('appointment-statuses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AppointmentStatusController {
  constructor(private readonly service: AppointmentStatusService) {}

  @Get()
  @ApiOperation({ summary: 'Listar status de agendamento' })
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Criar status' })
  create(@Body() dto: CreateAppointmentStatusDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar status' })
  update(@Param('id') id: string, @Body() dto: UpdateAppointmentStatusDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover status' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
