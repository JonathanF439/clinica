import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';

@Injectable()
export class ProcedureService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(search?: string) {
    return this.prisma.procedure.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { code: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { code: 'asc' },
    });
  }

  async findById(id: string) {
    const proc = await this.prisma.procedure.findUnique({ where: { id } });
    if (!proc) throw new NotFoundException('Procedimento não encontrado');
    return proc;
  }

  async create(dto: CreateProcedureDto) {
    const exists = await this.prisma.procedure.findUnique({ where: { code: dto.code } });
    if (exists) throw new ConflictException('Código já cadastrado');
    return this.prisma.procedure.create({ data: dto });
  }

  async update(id: string, dto: UpdateProcedureDto) {
    await this.findById(id);
    return this.prisma.procedure.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.procedure.delete({ where: { id } });
  }
}
