import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskEntity, TaskCategory, TaskStatus } from '../entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepo: Repository<TaskEntity>,
  ) {}

  async list(
    orgId: string,
    opts?: {
      category?: TaskCategory;
      status?: TaskStatus;
      sort?: 'sortOrder_asc' | 'createdAt_desc' | 'createdAt_asc';
    },
  ) {
    const qb = this.taskRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.org', 'org')
      .where('org.id = :orgId', { orgId });

    if (opts?.category) qb.andWhere('t.category = :category', { category: opts.category });
    if (opts?.status) qb.andWhere('t.status = :status', { status: opts.status });

    const sort = opts?.sort ?? 'sortOrder_asc';
    if (sort === 'createdAt_desc') qb.orderBy('t.createdAt', 'DESC');
    else if (sort === 'createdAt_asc') qb.orderBy('t.createdAt', 'ASC');
    else qb.orderBy('t.sortOrder', 'ASC').addOrderBy('t.createdAt', 'DESC');

    return qb.getMany();
  }

  // ✅ signature updated to allow controller to pass userId as 3rd arg
  // (you can enforce RBAC based on userId later if needed)
  async getOne(orgId: string, id: string, userId?: string) {
    const t = await this.taskRepo.findOne({
      where: { id, org: { id: orgId } as any },
      relations: { org: true },
    });
    if (!t) throw new NotFoundException('Task not found');
    return t;
  }

  async create(orgId: string, dto: CreateTaskDto) {
    const task = this.taskRepo.create({
      title: dto.title,
      description: dto.description,
      status: (dto.status ?? 'TODO') as any,
      category: (dto.category ?? 'WORK') as any,
      org: { id: orgId } as any,
    });

    // place at end of sortOrder list
    const max = await this.taskRepo
      .createQueryBuilder('t')
      .select('MAX(t.sortOrder)', 'max')
      .leftJoin('t.org', 'org')
      .where('org.id = :orgId', { orgId })
      .getRawOne<{ max: string | null }>();

    const next = (max?.max ? Number(max.max) : -1) + 1;
    task.sortOrder = next;

    return this.taskRepo.save(task);
  }

  async update(orgId: string, id: string, dto: UpdateTaskDto) {
    const t = await this.getOne(orgId, id);

    if (dto.title !== undefined) t.title = dto.title;
    if (dto.description !== undefined) t.description = dto.description;
    if (dto.status !== undefined) t.status = dto.status as any;
    if (dto.category !== undefined) t.category = dto.category as any;
    if (dto.sortOrder !== undefined) t.sortOrder = dto.sortOrder;

    return this.taskRepo.save(t);
  }

  async remove(orgId: string, id: string) {
    const t = await this.getOne(orgId, id);
    await this.taskRepo.remove(t);
    return { ok: true };
  }
}
