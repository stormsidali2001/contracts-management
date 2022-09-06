import {Body, Controller, Delete, Get, Param, Post, Put, Query} from '@nestjs/common';
import { CreateDepartementDTO } from 'src/core/dtos/departement.dto';
import { DepartementService } from '../services/departement.service';
@Controller('departements')
export class DepartementController{
    constructor(
        private readonly departementService:DepartementService
    ){}
    @Post("")
    async createDepartement(@Body() departement:CreateDepartementDTO){
        return await this.departementService.createDepartement(departement)
    }
    @Put(":id")
    async updateDepartement(@Param('id') id:string,@Body() departement:CreateDepartementDTO){
        return await this.departementService.updateDepartement(id,departement)
    }
    @Delete(":id")
    async deleteDepartement(@Param('id') id:string){
        return await this.departementService.deleteDepartement(id)
    }
    @Get(":id")
    async findById(@Param('id') id:string){
        return await this.departementService.findById(id)
    }
    @Get("")
    async findAll(@Query('offset') offset:number =0 ,@Query('limit') limit:number = 10){
        
        return await this.departementService.findAll(offset,limit);
    }
}