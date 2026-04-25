import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class CreateAppointmentStatusDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsInt()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
