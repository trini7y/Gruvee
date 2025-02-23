// event.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEventDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  start_time: Date;

  @IsNotEmpty()
  end_time: Date;
}

export class UpdateEventDto {
  @IsString()
  name?: string;

  @IsString()
  location?: string;

  start_time?: Date;

  end_time?: Date;
}
