import {Controller,Post,Body, Query, Get, ParseIntPipe} from '@nestjs/common';
import { CreateDirectionDTO } from 'src/core/dtos/direction.dto';
import { DirectionEntity } from 'src/core/entities/Direction.entity';
import { DirectionService } from '../services/direction.service';
@Controller('directions')
export class DirectionController{
    constructor(
        private readonly directionService:DirectionService
    ){}

    @Post('')
    async createDirection(@Body() direction:CreateDirectionDTO){
        console.log("...........................",JSON.stringify(direction))
        return await this.directionService.createDirection(direction)
    }
    @Get('')
    async findAll(@Query('offset',ParseIntPipe) offset:number = 0 ,@Query('limit',ParseIntPipe) limit:number = 10):Promise<DirectionEntity[]>{
        return await this.directionService.findAll(offset,limit);
    }   
}