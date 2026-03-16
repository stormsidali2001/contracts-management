import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional } from "class-validator";

export  class StatsParamsDTO{
  
    @IsOptional()
    @ApiPropertyOptional({  example:"2023-01-05"})
    @IsDateString({strict:true})
    startDate:Date;

    @IsOptional()
    @ApiPropertyOptional({  example:"2023-01-05"})
    @IsDateString({strict:true})
    endDate:Date;
}