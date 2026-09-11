import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ username });
  }

  count(): Promise<number> {
    return this.usersRepository.count();
  }

  create(username: string, passwordHash: string, name?: string): Promise<User> {
    const user = this.usersRepository.create({ username, passwordHash, name: name ?? null });
    return this.usersRepository.save(user);
  }

  async updateName(id: number, name: string): Promise<void> {
    await this.usersRepository.update(id, { name });
  }
}
