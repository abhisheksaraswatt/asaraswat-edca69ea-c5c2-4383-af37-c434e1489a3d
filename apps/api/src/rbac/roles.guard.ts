import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, Role } from './roles.decorator';
import { RbacService } from './rbac.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rbac: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const userId = req.user?.sub;

    const orgId = req.params?.orgId ?? req.body?.orgId ?? req.query?.orgId;
    if (!userId || !orgId) return false;

    const role = await this.rbac.getRole(userId, orgId);
    if (!role) return false;

    const rank: Record<Role, number> = {
      OWNER: 3,
      ADMIN: 2,
      VIEWER: 1,
    };

    return required.some((r) => rank[role] >= rank[r]);
  }
}
