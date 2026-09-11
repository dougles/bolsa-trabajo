import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  ci!: string;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsString()
  @IsNotEmpty()
  apellido!: string;

  @IsString()
  @IsNotEmpty()
  profesion!: string;

  @IsOptional()
  @IsString()
  puesto?: string;

  @IsOptional()
  @IsString()
  empresa?: string;

  @IsInt()
  @Min(1)
  @Max(10)
  calificacion!: number;

  @IsOptional()
  @IsString()
  comentario?: string;
}
