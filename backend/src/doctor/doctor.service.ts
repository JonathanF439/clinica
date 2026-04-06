import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Injectable()
export class DoctorService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.doctor.findMany({ orderBy: { name: 'asc' } });
  }

  async findById(id: string) {
    const doctor = await this.prisma.doctor.findUnique({ where: { id } });
    if (!doctor) throw new NotFoundException('Médico não encontrado');
    return doctor;
  }

  create(dto: CreateDoctorDto) {
    return this.prisma.doctor.create({
      data: { ...dto, crm: dto.crm || null },
    });
  }

  async update(id: string, dto: UpdateDoctorDto) {
    await this.findById(id);
    return this.prisma.doctor.update({
      where: { id },
      data: { ...dto, crm: dto.crm || null },
    });
  }
}
