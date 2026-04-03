import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProcedureService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.procedure.findMany({ orderBy: { name: 'asc' } });
  }
}
