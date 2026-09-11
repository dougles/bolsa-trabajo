import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Employee {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  ci!: string;

  @Column({ type: 'varchar', nullable: true })
  nombre!: string | null;

  @Column()
  apellido!: string;

  @Column()
  profesion!: string;

  @Column({ type: 'varchar', nullable: true })
  puesto!: string | null;

  @Column({ type: 'varchar', nullable: true })
  empresa!: string | null;

  @Column({ type: 'int' })
  calificacion!: number;

  @Column({ type: 'text', nullable: true })
  comentario!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
