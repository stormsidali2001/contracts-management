import {Controller,Post,Body, Query, Get, ParseIntPipe, Delete,Param,Put, UseGuards} from '@nestjs/common';
import { CreateDirectionDTO, updateDirectionDTO } from 'src/core/dtos/direction.dto';
import { DirectionEntity } from 'src/core/entities/Direction.entity';
import { UpdateResult } from 'typeorm';
import { DirectionService } from '../services/direction.service';
import {ApiTags} from '@nestjs/swagger';
import { JwtAccessTokenGuard } from 'src/auth/guards/jwt-access-token.guard';
import { RoleGuard } from 'src/auth/guards/Role.guard';
import { RequiredRoles } from 'src/auth/decorators/RequiredRoles.decorator';

@ApiTags('directions')
@Controller('directions')
export class DirectionController{
    constructor(
        private readonly directionService:DirectionService
    ){}

    // @RequiredRoles('admin')
    // @UseGuards(JwtAccessTokenGuard,RoleGuard)
    @Post('')
    async createDirection(@Body() direction:CreateDirectionDTO){
        console.log("...........................",JSON.stringify(direction))
        return await this.directionService.createDirection(direction)
    }
    @Get('')
    async findAll(@Query('offset') offset:number ,@Query('limit') limit:number ):Promise<DirectionEntity[]>{
        return await this.directionService.findAll(offset,limit);
    }   
    // @RequiredRoles('admin')
    // @UseGuards(JwtAccessTokenGuard,RoleGuard)
    @Delete(':id')
    async deleteDirection(@Param('id') id:string): Promise<string>{
        return await this.directionService.deleteDirection(id);
    }
    @Put(':id')
    async updateDirection(@Param('id') id:string,@Body() direction:updateDirectionDTO):Promise<UpdateResult>{
        return await this.directionService.updateDirection(id,direction)
    }
}