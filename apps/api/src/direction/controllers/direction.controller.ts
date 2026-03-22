import {Controller,Post,Body, Query, Get, ParseIntPipe, Delete,Param,Put, UseGuards} from '@nestjs/common';
import { CreateDirectionDTO, updateDirectionDTO } from 'src/core/dtos/direction.dto';
import { DirectionView } from '@contracts/types';
import { DirectionMapper } from 'src/core/mappers/direction.mapper';
import { DirectionService } from '../application/direction.service';
import {ApiTags} from '@nestjs/swagger';
import { JwtAccessTokenGuard } from 'src/auth/guards/jwt-access-token.guard';
import { RoleGuard } from 'src/auth/guards/Role.guard';
import { RequiredRoles } from 'src/auth/decorators/RequiredRoles.decorator';
import { UserRole } from 'src/core/types/UserRole.enum';

@ApiTags('directions')
@Controller('directions')
export class DirectionController{
    constructor(
        private readonly directionService:DirectionService
    ){}

    @RequiredRoles(UserRole.ADMIN)
    @UseGuards(JwtAccessTokenGuard,RoleGuard)
    @Post('')
    async createDirection(@Body() direction:CreateDirectionDTO){
        const result = await this.directionService.createDirection(direction);
        return DirectionMapper.from(result);
    }

    @UseGuards(JwtAccessTokenGuard)
    @Get('')
    async findAll(@Query('offset') offset:number ,@Query('limit') limit:number ):Promise<DirectionView[]>{
        const result = await this.directionService.findAll(offset,limit);
        return DirectionMapper.fromMany(result);
    }

    @RequiredRoles(UserRole.ADMIN)
    @UseGuards(JwtAccessTokenGuard,RoleGuard)
    @Delete(':id')
    async deleteDirection(@Param('id') id:string): Promise<string>{
        return await this.directionService.deleteDirection(id);
    }

    @RequiredRoles(UserRole.ADMIN)
    @UseGuards(JwtAccessTokenGuard,RoleGuard)
    @Put(':id')
    async updateDirection(@Param('id') id:string,@Body() direction:updateDirectionDTO):Promise<DirectionView>{
        const result = await this.directionService.updateDirection(id,direction);
        return DirectionMapper.from(result);
    }

    /**Testing routes */
    @Post('/test')
    async createDirectionTest(@Body() direction:CreateDirectionDTO){
        console.log("...........................",JSON.stringify(direction))
        const result = await this.directionService.createDirection(direction);
        return DirectionMapper.from(result);
    }
}