import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RbacService } from './rbac.service';
import { MembershipEntity } from '../entities/membership.entity';
import { RbacController } from './rbac.controller';
import { UserEntity } from '../entities/user.entity';
import { OrgEntity } from '../entities/org.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MembershipEntity, UserEntity, OrgEntity])],
  providers: [RbacService],
  controllers: [RbacController],
  exports: [RbacService],
})
export class RbacModule {}
