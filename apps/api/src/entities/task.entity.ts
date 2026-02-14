import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrgEntity } from './org.entity';

export type TaskStatus = 'TODO' | 'DONE';
export type TaskCategory = 'WORK' | 'PERSONAL';

@Entity('tasks')
export class TaskEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => OrgEntity, (o) => o.tasks, { nullable: false, onDelete: 'CASCADE' })
  org!: OrgEntity;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', default: 'TODO' })
  status!: TaskStatus;

  @Column({ type: 'text', default: 'WORK' })
  category!: TaskCategory;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
