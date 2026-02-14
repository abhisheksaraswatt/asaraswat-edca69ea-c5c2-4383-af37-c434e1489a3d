import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MembershipEntity } from '../entities/membership.entity';

export type Role = 'OWNER' | 'ADMIN' | 'VIEWER';

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(MembershipEntity)
    private readonly membershipRepo: Repository<MembershipEntity>
  ) {}

  async getMembership(userId: string, orgId: string) {
    return this.membershipRepo.findOne({
      where: {
        user: { id: userId } as any,
        org: { id: orgId } as any,
      },
      relations: { user: true, org: true },
    });
  }

  // ✅ Back-compat for your existing RolesGuard
  async getRole(userId: string, orgId: string): Promise<Role | null> {
    const membership = await this.getMembership(userId, orgId);
    const role = (membership as any)?.role as Role | undefined;
    return role ?? null;
  }

  async requireOrgMember(userId: string, orgId: string) {
    const membership = await this.getMembership(userId, orgId);
    if (!membership) throw new ForbiddenException('Not a member of this organization');
    return membership;
  }

  async requireRole(userId: string, orgId: string, allowed: Role[]) {
    const membership = await this.requireOrgMember(userId, orgId);
    const role = (membership as any).role as Role;

    if (!allowed.includes(role)) {
      throw new ForbiddenException('Insufficient role for this action');
    }
    return membership;
  }

  canWrite(role: Role) {
    return role === 'OWNER' || role === 'ADMIN';
  }
}
