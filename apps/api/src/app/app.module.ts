import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { typeOrmConfig } from '../db/typeorm.config';

import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { RbacModule } from '../rbac/rbac.module';
import { TasksModule } from '../tasks/tasks.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    // 🔧 Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/api/.env',
    }),

    // 🗄️ Database
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: typeOrmConfig,
    }),

    // 🔐 Auth & RBAC
    AuthModule,
    RbacModule,

    // 📝 Core features
    TasksModule,
    AuditLogModule,
  ],

  controllers: [AppController],

  providers: [
    AppService,

    // 🔒 Global JWT protection (everything locked by default)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
