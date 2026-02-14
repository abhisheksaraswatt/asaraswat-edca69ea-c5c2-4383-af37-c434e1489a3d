import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Index } from 'typeorm';
import { OrgEntity } from './org.entity';
import { UserEntity } from './user.entity';

export type AuditAction =
  | 'TASK_CREATE'
  | 'TASK_UPDATE'
  | 'TASK_DELETE'
  | 'AUTH_LOGIN'
  | 'AUTH_REGISTER'
  | 'PERMISSION_DENIED';

@Entity('audit_logs')
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @ManyToOne(() => OrgEntity, { eager: true })
  org!: OrgEntity;

  @ManyToOne(() => UserEntity, { eager: true, nullable: true })
  actor?: UserEntity | null;

  @Column({ type: 'varchar', length: 30 })
  action!: AuditAction;

  @Column({ type: 'jsonb', nullable: true })
  meta!: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt!: Date;
}
