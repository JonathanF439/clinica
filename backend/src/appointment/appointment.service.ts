import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentService {
  constructor(private readonly prisma: PrismaService) {}

  async findByDate(
    date?: string,
    doctorId?: string,
    currentUser?: { id: string; role: string },
    startDate?: string,
    endDate?: string,
  ) {
    let resolvedDoctorId = doctorId;

    if (currentUser?.role === 'MEDICO') {
      const linkedDoctor = await this.prisma.doctor.findUnique({
        where: { userId: currentUser.id },
      });
      if (!linkedDoctor) return [];
      resolvedDoctorId = linkedDoctor.id;
    }

    let dateFilter: object = {};
    if (startDate && endDate) {
      // Parse without timezone by splitting the string directly
      const [sy, sm, sd] = startDate.split('-').map(Number);
      const [ey, em, ed] = endDate.split('-').map(Number);
      const cur = new Date(sy, sm - 1, sd);
      const end = new Date(ey, em - 1, ed);
      const dates: string[] = [];
      while (cur <= end) {
        const y = cur.getFullYear();
        const m = String(cur.getMonth() + 1).padStart(2, '0');
        const d = String(cur.getDate()).padStart(2, '0');
        dates.push(`${y}-${m}-${d}`);
        cur.setDate(cur.getDate() + 1);
      }
      dateFilter = { date: { in: dates } };
    } else if (date) {
      dateFilter = { date };
    }

    return this.prisma.appointment.findMany({
      where: {
        ...dateFilter,
        ...(resolvedDoctorId ? { doctorId: resolvedDoctorId } : {}),
      },
      include: { patient: true, doctor: true },
      orderBy: [{ date: 'asc' }, { callOrder: 'asc' }, { time: 'asc' }],
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

  async create(dto: CreateAppointmentDto) {
    // Auto-assign callOrder: next number for this doctor+date
    const count = await this.prisma.appointment.count({
      where: { doctorId: dto.doctorId, date: dto.date },
    });

    return this.prisma.appointment.create({
      data: { ...dto, callOrder: count + 1 },
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

  async updateStatus(id: string, status: string) {
    await this.findById(id);
    return this.prisma.appointment.update({
      where: { id },
      data: { status },
      include: { patient: true, doctor: true },
    });
  }

  async reorder(items: { id: string; callOrder: number }[]) {
    await this.prisma.$transaction(
      items.map(({ id, callOrder }) =>
        this.prisma.appointment.update({ where: { id }, data: { callOrder } }),
      ),
    );
  }
}
