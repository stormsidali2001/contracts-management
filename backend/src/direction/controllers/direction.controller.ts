import {Controller,Post,Body, Query, Get, ParseIntPipe, Delete,Param,Put} from '@nestjs/common';
import { CreateDirectionDTO, updateDirectionDTO } from 'src/core/dtos/direction.dto';
import { DirectionEntity } from 'src/core/entities/Direction.entity';
import { UpdateResult } from 'typeorm';
import { DirectionService } from '../services/direction.service';
import {ApiTags} from '@nestjs/swagger';

@ApiTags('directions')
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
    @Delete(':id')
    async deleteDirection(@Param('id') id:string): Promise<string>{
        return await this.directionService.deleteDirection(id);
    }
    @Put(':id')
    async updateDirection(@Param('id') id:string,@Body() direction:updateDirectionDTO):Promise<UpdateResult>{
        return await this.directionService.updateDirection(id,direction)
    }
}