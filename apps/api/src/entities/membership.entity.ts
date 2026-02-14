import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Index } from 'typeorm';
import { UserEntity } from './user.entity';
import { OrgEntity } from './org.entity';

export type Role = 'OWNER' | 'ADMIN' | 'VIEWER';

@Entity('memberships')
@Index(['user', 'org'], { unique: true })
export class MembershipEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => UserEntity, (u) => u.memberships, { eager: true })
  user!: UserEntity;

  @ManyToOne(() => OrgEntity, { eager: true })
  org!: OrgEntity;

  @Column({ type: 'varchar', length: 10 })
  role!: Role;
}
