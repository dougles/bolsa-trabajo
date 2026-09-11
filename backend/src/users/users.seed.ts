import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersService } from './users.service.js';

const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_PASSWORD = 'admin123';

@Injectable()
export class UsersSeed implements OnModuleInit {
  private readonly logger = new Logger(UsersSeed.name);

  constructor(private readonly usersService: UsersService) {}

  async onModuleInit(): Promise<void> {
    const existing = await this.usersService.count();
    if (existing > 0) {
      this.logger.log('Usuario admin ya existe, no se vuelve a crear.');
      return;
    }

    const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
    await this.usersService.create(DEFAULT_ADMIN_USERNAME, passwordHash);
    this.logger.log(
      `Usuario admin creado (username: ${DEFAULT_ADMIN_USERNAME}, password: ${DEFAULT_ADMIN_PASSWORD}). Cambiar en producción.`,
    );
  }
}
