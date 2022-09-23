import { Body, Controller, Delete, Get, Param, ParseIntPipe, Put, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserEntity } from "src/core/entities/User.entity";
import { PaginationResponse } from "src/core/types/paginationResponse.interface";
import { UpdateResult } from "typeorm";
import { UpdateUserDTO } from "../../core/dtos/user.dto";
import { UserService } from "../user.service";

@ApiTags('users')
@Controller('users')
export class UserController{
    constructor(
        private readonly userService:UserService
    ){}
    
    @Get('')
    async findAll(@Query('offset') offset:number = 0 ,@Query('limit') limit:number = 10 ,@Query('orderBy') orderBy:string  = undefined , @Query('searchQuery') searchQuery:string):Promise<PaginationResponse<UserEntity>>{
        return await  this.userService.findAll(offset,limit,orderBy,searchQuery);
    }   
    
    // @Delete(':id')
    // async deleteUser(@Param('id') id:string): Promise<string>{
       
    // }
    @Put(':id')
    async updateUser(@Param('id') id:string,@Body() user:UpdateUserDTO):Promise<UpdateResult>{
        return this.updateUser(id,user)
    }
}