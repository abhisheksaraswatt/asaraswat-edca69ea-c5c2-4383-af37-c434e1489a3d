import { Body, Controller, Post, UseGuards, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MembershipEntity } from '../entities/membership.entity';
import { UserEntity } from '../entities/user.entity';
import { OrgEntity } from '../entities/org.entity';

@Controller('rbac')
@UseGuards(JwtAuthGuard)
export class RbacController {
  constructor(
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
    @InjectRepository(OrgEntity) private readonly orgs: Repository<OrgEntity>,
    @InjectRepository(MembershipEntity) private readonly memberships: Repository<MembershipEntity>,
  ) {}

  @Post('add-member')
  async addMember(
    @Body() body: { orgId: string; email: string; role: 'OWNER' | 'ADMIN' | 'VIEWER' }
  ) {
    const org = await this.orgs.findOne({ where: { id: body.orgId } as any });
    if (!org) throw new NotFoundException('Org not found');

    const user = await this.users.findOne({ where: { email: body.email } as any });
    if (!user) throw new NotFoundException('User not found');

    const existing = await this.memberships.findOne({
      where: {
        org: { id: org.id } as any,
        user: { id: user.id } as any,
      } as any,
      relations: { org: true, user: true } as any,
    });

    if (!existing) {
      // ✅ cast to single entity to avoid TS choosing the array overload
      const created = this.memberships.create({
        org: { id: org.id } as any,
        user: { id: user.id } as any,
        role: body.role as any,
      } as any) as unknown as MembershipEntity;

      const saved = await this.memberships.save(created as any);

      return { ok: true, orgId: org.id, userId: user.id, role: (saved as any).role };
    }

    (existing as any).role = body.role as any;
    const saved = await this.memberships.save(existing as any);

    return { ok: true, orgId: org.id, userId: user.id, role: (saved as any).role };
  }
}
