import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';

import { Roles } from '../rbac/roles.decorator';
import { RolesGuard } from '../rbac/roles.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 🔐 Protected by global JWT guard
  @Get()
  getData() {
    return this.appService.getData();
  }

  // 🔐 RBAC Test Route
  // Requires:
  // - Valid JWT
  // - Role OWNER for provided orgId
  @Get('rbac-check')
  @UseGuards(RolesGuard)
  @Roles('OWNER')
  rbacCheck(@Query('orgId') orgId: string) {
    return {
      message: 'RBAC check passed',
      orgId,
    };
  }
}
