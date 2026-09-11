import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import { QueryEmployeeDto } from './dto/query-employee.dto.js';
import { UpdateEmployeeDto } from './dto/update-employee.dto.js';
import { Employee } from './employee.entity.js';

export interface PaginatedEmployees {
  data: Employee[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
  ) {}

  private async assertCiIsFree(ci: string, ignoreId?: number): Promise<void> {
    const existing = await this.employeesRepository.findOneBy({ ci });
    if (existing && existing.id !== ignoreId) {
      throw new ConflictException(`Ya existe un empleado con CI ${ci}`);
    }
  }

  async findAll(query: QueryEmployeeDto): Promise<PaginatedEmployees> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const qb = this.employeesRepository.createQueryBuilder('employee');

    if (query.search) {
      const search = `%${query.search}%`;
      qb.where(
        'employee.ci LIKE :search OR employee.nombre LIKE :search OR employee.apellido LIKE :search OR employee.empresa LIKE :search OR employee.profesion LIKE :search',
        { search },
      );
    }

    qb.orderBy('employee.apellido', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findOne(id: number): Promise<Employee> {
    const employee = await this.employeesRepository.findOneBy({ id });
    if (!employee) {
      throw new NotFoundException(`Empleado ${id} no encontrado`);
    }
    return employee;
  }

  async create(dto: CreateEmployeeDto): Promise<Employee> {
    await this.assertCiIsFree(dto.ci);
    const employee = this.employeesRepository.create(dto);
    return this.employeesRepository.save(employee);
  }

  async update(id: number, dto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findOne(id);
    if (dto.ci && dto.ci !== employee.ci) {
      await this.assertCiIsFree(dto.ci, id);
    }
    Object.assign(employee, dto);
    return this.employeesRepository.save(employee);
  }

  async remove(id: number): Promise<void> {
    const employee = await this.findOne(id);
    await this.employeesRepository.remove(employee);
  }
}
