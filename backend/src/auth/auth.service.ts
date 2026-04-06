import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByLogin(loginDto.login);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const passwordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = { sub: user.id, login: user.login, role: user.role };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        name: user.name,
        login: user.login,
        role: user.role,
      },
    };
  }

  async validateUser(payload: { sub: string; login: string; role: string }) {
    return this.userService.findById(payload.sub);
  }
}
