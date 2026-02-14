import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { JwtStrategy } from './jwt.strategy';

import { UserEntity } from '../entities/user.entity';
import { AuditLogEntity } from '../entities/audit-log.entity';
import { OrgEntity } from '../entities/org.entity';
import { MembershipEntity } from '../entities/membership.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      AuditLogEntity,
      OrgEntity,
      MembershipEntity,
    ]),

    // ✅ REQUIRED for AuthGuard('jwt') to work
    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy, // ✅ REQUIRED so the "jwt" strategy exists
  ],
  exports: [JwtModule],
})
export class AuthModule {}
