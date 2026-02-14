import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';

@Entity('orgs')
export class OrgEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ length: 100 })
  name!: string;

  @ManyToOne(() => OrgEntity, (o) => o.children, { nullable: true })
  parent?: OrgEntity | null;

  @OneToMany(() => OrgEntity, (o) => o.parent)
  children!: OrgEntity[];

  // ✅ Use string entity name to avoid circular import (TaskEntity <-> OrgEntity)
  @OneToMany('TaskEntity', 'org')
  tasks!: any[];
}
