import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditLogController } from './audit-log.controller';
import { AuditLogService } from './audit-log.service';

import { AuditLogEntity } from '../entities/audit-log.entity';
import { MembershipEntity } from '../entities/membership.entity';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLogEntity, MembershipEntity]),
    RbacModule, // ✅ needed so RolesGuard can resolve RbacService
  ],
  controllers: [AuditLogController],
  providers: [AuditLogService],
})
export class AuditLogModule {}
