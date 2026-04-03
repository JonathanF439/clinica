import { IsString, IsNotEmpty, IsOptional, IsEmail, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePatientDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cpf?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  susCard?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  birthDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  maritalStatus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sex?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  race?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  naturality?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rg?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profession?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workplace?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone2?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phoneResidencial?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phoneComercial?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addrStreet?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addrNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addrComplement?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addrNeighborhood?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addrCep?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addrCity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addrUf?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addrIbgeCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  @Type(() => Number)
  stars?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entryDate?: string;

  @ApiPropertyOptional({ default: 'Física' })
  @IsOptional()
  @IsString()
  personType?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  cadastroIncompleto?: boolean;
}
