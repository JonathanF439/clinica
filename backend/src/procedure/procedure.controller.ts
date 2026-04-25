import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProcedureService } from './procedure.service';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Procedures')
@Controller('procedures')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProcedureController {
  constructor(private readonly procedureService: ProcedureService) {}

  @Get()
  @ApiOperation({ summary: 'Listar procedimentos' })
  findAll(@Query('search') search?: string) {
    return this.procedureService.findAll(search);
  }

  @Post()
  @ApiOperation({ summary: 'Criar procedimento' })
  create(@Body() dto: CreateProcedureDto) {
    return this.procedureService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar procedimento' })
  update(@Param('id') id: string, @Body() dto: UpdateProcedureDto) {
    return this.procedureService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover procedimento' })
  remove(@Param('id') id: string) {
    return this.procedureService.remove(id);
  }
}
