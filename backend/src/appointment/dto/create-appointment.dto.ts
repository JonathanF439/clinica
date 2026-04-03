import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAppointmentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  doctorId: string;

  @ApiProperty({ example: '2026-03-31' })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: '08:30' })
  @IsString()
  @IsNotEmpty()
  time: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  procedureCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  procedureName?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  value?: number;

  @ApiPropertyOptional({ default: 'Aguardando' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  obsAgenda?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  obsTratamento?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isRegistered?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  receptionist?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  arrivalTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  wait?: string;
}
