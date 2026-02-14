import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity } from '../entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditRepo: Repository<AuditLogEntity>,
  ) {}

  async listByOrg(orgId: string) {
    return this.auditRepo.find({
        where: { org: { id: orgId } as any },
        relations: { org: true, actor: true },
        select: {
            id: true,
            action: true,
            meta: true,
            createdAt: true,
            org: { id: true, name: true } as any,
            actor: { id: true, email: true, fullName: true } as any,
        } as any,
        order: { createdAt: 'DESC' as any },
    });
  }
}
