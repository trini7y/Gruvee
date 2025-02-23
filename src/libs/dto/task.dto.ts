import { IsNotEmpty, IsString, IsArray, IsISO8601 } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsArray()
  assigned_to: number[];

  @IsISO8601()
  due_time: string;
}

export class UpdateTaskDto {
  @IsString()
  title?: string;

  @IsString()
  description?: string;

  @IsArray()
  assigned_to?: number[];

  @IsISO8601()
  due_time?: string;
}
