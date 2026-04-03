import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProcedureService } from './procedure.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Procedures')
@Controller('procedures')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProcedureController {
  constructor(private readonly procedureService: ProcedureService) {}

  @Get()
  @ApiOperation({ summary: 'Listar procedimentos' })
  findAll() {
    return this.procedureService.findAll();
  }
}
