import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TasksController } from './tasks.controller';
import { TasksAliasController } from './tasks.alias.controller';
import { TasksService } from './tasks.service';

import { TaskEntity } from '../entities/task.entity';
import { OrgEntity } from '../entities/org.entity';
import { UserEntity } from '../entities/user.entity';
import { AuditLogEntity } from '../entities/audit-log.entity';

import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaskEntity, OrgEntity, UserEntity, AuditLogEntity]),
    RbacModule,
  ],
  controllers: [
    TasksController,        // /orgs/:orgId/tasks...
    TasksAliasController,   // /tasks...
  ],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
