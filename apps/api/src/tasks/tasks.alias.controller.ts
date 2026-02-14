import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../rbac/roles.decorator';
import { RolesGuard } from '../rbac/roles.guard';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

/**
 * IMPORTANT:
 * If your app has global prefix "api" (common in Nest),
 * then Controller('tasks') becomes /api/tasks ✅
 * DO NOT write 'api/tasks' here.
 */
@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksAliasController {
  constructor(private readonly tasks: TasksService) {}

  private requireOrgId(orgId?: string): string {
    if (!orgId) throw new Error('orgId is required');
    return orgId;
  }

  // ✅ dashboard list
  @Get()
  list(@Req() req: any, @Query('orgId') orgId?: string) {
    const userId = req.user?.sub;
    return this.tasks.list(this.requireOrgId(orgId), userId);
  }

  // ✅ optional: fetch one
  @Get(':id')
  getOne(@Req() req: any, @Param('id') id: string, @Query('orgId') orgId?: string) {
    const userId = req.user?.sub;
    return this.tasks.getOne(this.requireOrgId(orgId), id, userId);
  }

  // ✅ only ADMIN/OWNER can create
  @Post()
  @Roles('ADMIN', 'OWNER')
  create(@Body() dto: CreateTaskDto, @Query('orgId') orgId?: string) {
    return this.tasks.create(this.requireOrgId(orgId), dto);
  }

  // ✅ only ADMIN/OWNER can update
  @Put(':id')
  @Roles('ADMIN', 'OWNER')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @Query('orgId') orgId?: string,
  ) {
    return this.tasks.update(this.requireOrgId(orgId), id, dto);
  }

  // ✅ only ADMIN/OWNER can delete
  @Delete(':id')
  @Roles('ADMIN', 'OWNER')
  remove(@Param('id') id: string, @Query('orgId') orgId?: string) {
    return this.tasks.remove(this.requireOrgId(orgId), id);
  }
}
