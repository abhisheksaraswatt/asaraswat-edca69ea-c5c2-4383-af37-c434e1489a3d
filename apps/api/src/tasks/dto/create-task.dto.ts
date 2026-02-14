import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['TODO', 'DONE'])
  status?: 'TODO' | 'DONE';

  @IsOptional()
  @IsIn(['WORK', 'PERSONAL'])
  category?: 'WORK' | 'PERSONAL';
}
