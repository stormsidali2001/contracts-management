import {Controller,Post,Body} from '@nestjs/common';
import { CreateDirectionDTO } from 'src/core/dtos/direction.dto';
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
}