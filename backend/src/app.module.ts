import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module.js';
import { Employee } from './employees/employee.entity.js';
import { EmployeesModule } from './employees/employees.module.js';
import { User } from './users/user.entity.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'better-sqlite3' as const,
        database: configService.get<string>('DB_PATH', 'data/db.sqlite'),
        entities: [User, Employee],
        synchronize: true,
      }),
    }),
    UsersModule,
    AuthModule,
    EmployeesModule,
  ],
})
export class AppModule {}
