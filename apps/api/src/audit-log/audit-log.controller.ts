import { BadRequestException, Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuditLogService } from './audit-log.service';
import { RbacService, Role } from '../rbac/rbac.service';

@Controller('audit-log')
@UseGuards(JwtAuthGuard)
export class AuditLogController {
  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly rbac: RbacService
  ) {}

  @Get()
  async list(@Req() req: any, @Query('orgId') orgId?: string) {
    const userId: string | undefined = req.user?.sub;
    if (!orgId) throw new BadRequestException('orgId is required as query param');

    // ✅ Only OWNER/ADMIN for the requested org
    await this.rbac.requireRole(userId, orgId, ['OWNER', 'ADMIN'] satisfies Role[]);

    return this.auditLogService.listByOrg(orgId);
  }
}
