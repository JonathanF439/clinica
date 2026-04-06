import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findByLogin(login: string) {
    return this.prisma.user.findUnique({ where: { login } });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, login: true, role: true, createdAt: true },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, name: true, login: true, role: true, createdAt: true },
    });
  }

  async create(createUserDto: CreateUserDto) {
    const existing = await this.findByLogin(createUserDto.login);
    if (existing) {
      throw new ConflictException('Login já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      select: { id: true, name: true, login: true, role: true, createdAt: true },
    });
  }
}
