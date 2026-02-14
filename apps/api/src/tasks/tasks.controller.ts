import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TasksService } from './tasks.service';

// If you still need this controller (looks like a nested route style).
// Keeps compatibility but passes userId.

@Controller('orgs/:orgId/tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  list(@Req() req: any, @Param('orgId') orgId: string) {
    const userId = req.user?.sub;
    return this.tasks.list(orgId, userId);
  }

  @Get(':taskId')
  getOne(@Req() req: any, @Param('orgId') orgId: string, @Param('taskId') taskId: string) {
    const userId = req.user?.sub;
    return this.tasks.getOne(orgId, taskId, userId);
  }
}
