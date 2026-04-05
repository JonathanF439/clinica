import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@ApiTags('Doctors')
@Controller('doctors')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Get()
  @RequirePermission('doctor', 'read')
  @ApiOperation({ summary: 'Listar médicos' })
  findAll() {
    return this.doctorService.findAll();
  }

  @Get(':id')
  @RequirePermission('doctor', 'read')
  @ApiOperation({ summary: 'Buscar médico por ID' })
  findById(@Param('id') id: string) {
    return this.doctorService.findById(id);
  }

  @Post()
  @RequirePermission('doctor', 'create')
  @ApiOperation({ summary: 'Criar médico' })
  create(@Body() dto: CreateDoctorDto) {
    return this.doctorService.create(dto);
  }

  @Patch(':id')
  @RequirePermission('doctor', 'update')
  @ApiOperation({ summary: 'Atualizar médico' })
  update(@Param('id') id: string, @Body() dto: UpdateDoctorDto) {
    return this.doctorService.update(id, dto);
  }
}
