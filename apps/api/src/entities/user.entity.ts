import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Index } from 'typeorm';
import { MembershipEntity } from './membership.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ length: 200 })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ length: 120 })
  fullName!: string;

  @OneToMany(() => MembershipEntity, (m) => m.user)
  memberships!: MembershipEntity[];
}
