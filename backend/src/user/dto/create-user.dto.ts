import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'ADMIN',
  MEDICO = 'MEDICO',
  RECEPCIONISTA = 'RECEPCIONISTA',
  PACIENTE = 'PACIENTE',
}

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.RECEPCIONISTA })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
