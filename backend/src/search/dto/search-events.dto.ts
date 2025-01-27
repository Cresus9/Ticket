import { IsString, IsOptional, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SortBy {
  DATE_ASC = 'date_asc',
  DATE_DESC = 'date_desc',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  POPULARITY = 'popularity',
}

export class SearchEventsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxPrice?: number;

  @ApiProperty({ enum: SortBy, required: false })
  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy;

  @ApiProperty({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiProperty({ default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit: number = 10;
}