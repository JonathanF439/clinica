import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@ApiTags('Patients')
@Controller('patients')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get()
  @RequirePermission('patient', 'read')
  @ApiOperation({ summary: 'Listar pacientes' })
  @ApiQuery({ name: 'search', required: false })
  findAll(@Query('search') search?: string) {
    return this.patientService.findAll(search);
  }

  @Get(':id')
  @RequirePermission('patient', 'read')
  @ApiOperation({ summary: 'Buscar paciente por ID' })
  findById(@Param('id') id: string) {
    return this.patientService.findById(id);
  }

  @Post()
  @RequirePermission('patient', 'create')
  @ApiOperation({ summary: 'Criar paciente' })
  create(@Body() dto: CreatePatientDto) {
    return this.patientService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('patient', 'update')
  @ApiOperation({ summary: 'Atualizar paciente' })
  update(@Param('id') id: string, @Body() dto: UpdatePatientDto) {
    return this.patientService.update(id, dto);
  }
}
