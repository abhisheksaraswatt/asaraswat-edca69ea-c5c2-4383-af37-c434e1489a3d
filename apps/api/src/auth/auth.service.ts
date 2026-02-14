import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { UserEntity } from '../entities/user.entity';
import { AuditLogEntity } from '../entities/audit-log.entity';
import { OrgEntity } from '../entities/org.entity';
import { MembershipEntity } from '../entities/membership.entity';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(UserEntity) private users: Repository<UserEntity>,
    @InjectRepository(AuditLogEntity) private audit: Repository<AuditLogEntity>,
    @InjectRepository(OrgEntity) private orgs: Repository<OrgEntity>,
    @InjectRepository(MembershipEntity)
    private memberships: Repository<MembershipEntity>,

    private jwt: JwtService
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();

    const existing = await this.users.findOne({ where: { email } });
    if (existing) throw new ConflictException('Email already exists');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const { user } = await this.dataSource.transaction(async (manager) => {
      // 1) Create user
      const user = manager.create(UserEntity, {
        email,
        fullName: dto.fullName,
        passwordHash,
      });
      await manager.save(user);

      // 2) Create org
      const org = manager.create(OrgEntity, {
        name: `${email.split('@')[0]}'s Org`,
      });
      await manager.save(org);

      // 3) Create membership OWNER (relations)
      const membership = manager.create(MembershipEntity, {
        user,
        org,
        role: 'OWNER',
      });
      await manager.save(membership);

      // 4) Audit log (attach correct org)
      const audit = manager.create(AuditLogEntity, {
        org,
        actor: user,
        action: 'AUTH_REGISTER',
        meta: { email: user.email },
      });
      await manager.save(audit);

      return { user };
    });

    return this.issueToken(user);
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase();

    const user = await this.users.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    // Find a membership to get org context for audit logging
    const membership = await this.memberships.findOne({
      where: { user: { id: user.id } as any },
      relations: { org: true, user: true },
    });

    if (membership?.org) {
      await this.audit.save({
        org: membership.org,
        actor: user,
        action: 'AUTH_LOGIN',
        meta: { email: user.email },
      });
    }

    return this.issueToken(user);
  }

  async me(userId: string) {
    const memberships = await this.memberships.find({
      where: { user: { id: userId } as any },
      relations: { org: true },
    });

    return {
      userId,
      memberships: memberships.map((m) => ({
        orgId: m.org.id,
        orgName: m.org.name,
        role: m.role,
      })),
    };
  }

  private issueToken(user: UserEntity) {
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwt.sign(payload),
      user: { id: user.id, email: user.email, fullName: user.fullName },
    };
  }
}
