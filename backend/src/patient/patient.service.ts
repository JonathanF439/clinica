import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(search?: string) {
    if (!search) return this.prisma.patient.findMany({ orderBy: { name: 'asc' } });

    const digits = search.replace(/\D/g, '');
    const cpfFormatted =
      digits.length === 11
        ? digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
        : null;

    return this.prisma.patient.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { cpf: { contains: search } },
          ...(cpfFormatted ? [{ cpf: { contains: cpfFormatted } }] : []),
          ...(digits.length > 2 ? [{ cpf: { contains: digits } }] : []),
        ],
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const patient = await this.prisma.patient.findUnique({ where: { id } });
    if (!patient) throw new NotFoundException('Paciente não encontrado');
    return patient;
  }

  async create(dto: CreatePatientDto) {
    if (dto.cpf) {
      const existing = await this.prisma.patient.findUnique({ where: { cpf: dto.cpf } });
      if (existing) throw new ConflictException('CPF já cadastrado');
    }
    return this.prisma.patient.create({ data: dto });
  }

  async update(id: string, dto: UpdatePatientDto) {
    await this.findById(id);
    return this.prisma.patient.update({ where: { id }, data: dto });
  }
}
