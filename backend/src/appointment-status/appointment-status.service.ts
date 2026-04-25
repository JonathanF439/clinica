import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentStatusDto } from './dto/create-appointment-status.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';

@Injectable()
export class AppointmentStatusService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.appointmentStatus.findMany({ orderBy: { order: 'asc' } });
  }

  async findById(id: string) {
    const status = await this.prisma.appointmentStatus.findUnique({ where: { id } });
    if (!status) throw new NotFoundException('Status não encontrado');
    return status;
  }

  async create(dto: CreateAppointmentStatusDto) {
    const exists = await this.prisma.appointmentStatus.findUnique({ where: { name: dto.name } });
    if (exists) throw new ConflictException('Nome já cadastrado');
    if (dto.order === undefined) {
      const count = await this.prisma.appointmentStatus.count();
      dto.order = count + 1;
    }
    return this.prisma.appointmentStatus.create({ data: dto });
  }

  async update(id: string, dto: UpdateAppointmentStatusDto) {
    await this.findById(id);
    return this.prisma.appointmentStatus.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.appointmentStatus.delete({ where: { id } });
  }
}
