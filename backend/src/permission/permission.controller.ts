import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { PermissionService } from './permission.service';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';

@ApiTags('Permissions')
@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @RequirePermission('user', 'read')
  @ApiOperation({ summary: 'Listar permissões (admin)' })
  findAll() {
    return this.permissionService.findAll();
  }

  @Patch()
  @RequirePermission('user', 'create')
  @ApiOperation({ summary: 'Atualizar permissão (admin)' })
  update(@Body() dto: UpdatePermissionDto) {
    return this.permissionService.upsert(dto.role, dto.resource, dto.action, dto.allowed);
  }
}
