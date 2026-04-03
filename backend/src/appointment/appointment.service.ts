import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentService {
  constructor(private readonly prisma: PrismaService) {}

  findByDate(date?: string, doctorId?: string) {
    return this.prisma.appointment.findMany({
      where: {
        ...(date ? { date } : {}),
        ...(doctorId ? { doctorId } : {}),
      },
      include: { patient: true, doctor: true },
      orderBy: { time: 'asc' },
    });
  }

  findByPatient(patientId: string) {
    return this.prisma.appointment.findMany({
      where: { patientId },
      include: { doctor: true },
      orderBy: [{ date: 'desc' }, { time: 'asc' }],
    });
  }

  async findById(id: string) {
    const appt = await this.prisma.appointment.findUnique({
      where: { id },
      include: { patient: true, doctor: true },
    });
    if (!appt) throw new NotFoundException('Agendamento não encontrado');
    return appt;
  }

  create(dto: CreateAppointmentDto) {
    return this.prisma.appointment.create({
      data: dto,
      include: { patient: true, doctor: true },
    });
  }

  async update(id: string, dto: UpdateAppointmentDto) {
    await this.findById(id);
    return this.prisma.appointment.update({
      where: { id },
      data: dto,
      include: { patient: true, doctor: true },
    });
  }
}
