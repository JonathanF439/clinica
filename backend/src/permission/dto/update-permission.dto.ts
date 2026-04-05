import { IsString, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class UpdatePermissionDto {
  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty()
  @IsString()
  resource: string;

  @ApiProperty()
  @IsString()
  action: string;

  @ApiProperty()
  @IsBoolean()
  allowed: boolean;
}
