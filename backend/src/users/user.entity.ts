import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column({ type: 'varchar', nullable: true })
  name!: string | null;

  @Column()
  passwordHash!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
