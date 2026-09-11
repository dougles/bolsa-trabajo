import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersService } from './users.service.js';

const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_PASSWORD = 'admin123';
const DEFAULT_ADMIN_NAME = 'Imprenta Soliz';

@Injectable()
export class UsersSeed implements OnModuleInit {
  private readonly logger = new Logger(UsersSeed.name);

  constructor(private readonly usersService: UsersService) {}

  async onModuleInit(): Promise<void> {
    const existingAdmin = await this.usersService.findByUsername(DEFAULT_ADMIN_USERNAME);
    if (existingAdmin) {
      if (!existingAdmin.name) {
        await this.usersService.updateName(existingAdmin.id, DEFAULT_ADMIN_NAME);
        this.logger.log(`Usuario admin actualizado con name: ${DEFAULT_ADMIN_NAME}.`);
      } else {
        this.logger.log('Usuario admin ya existe, no se vuelve a crear.');
      }
      return;
    }

    const existing = await this.usersService.count();
    if (existing > 0) {
      this.logger.log('Ya existen usuarios, no se crea el admin por defecto.');
      return;
    }

    const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
    await this.usersService.create(DEFAULT_ADMIN_USERNAME, passwordHash, DEFAULT_ADMIN_NAME);
    this.logger.log(
      `Usuario admin creado (username: ${DEFAULT_ADMIN_USERNAME}, password: ${DEFAULT_ADMIN_PASSWORD}). Cambiar en producción.`,
    );
  }
}
