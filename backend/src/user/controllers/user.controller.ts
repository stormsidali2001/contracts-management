import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Put, Query, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { CurrentUserId } from "src/auth/decorators/currentUserId.decorator";
import { JwtAccessTokenGuard } from "src/auth/guards/jwt-access-token.guard";
import { UserEntity } from "src/core/entities/User.entity";
import { PaginationResponse } from "src/core/types/paginationResponse.interface";
import { UserRole } from "src/core/types/UserRole.enum";
import { StatsParamsDTO } from "src/statistics/models/statsPramsDTO.interface";
import { UpdateResult } from "typeorm";
import { UpdateUserDTO } from "../../core/dtos/user.dto";
import { UserService } from "../user.service";

@ApiTags('users')
@Controller('users')
export class UserController{
    constructor(
        private readonly userService:UserService
    ){}

    @UseGuards(JwtAccessTokenGuard)
    @Get('types-stats')
    async getUserTypesStats(@Query() params:StatsParamsDTO){
        return await  this.userService.getUserTypesStats(params)
    }
    
    @Get('')
    async findAll(
            @Query('offset') offset:number = 0 ,
            @Query('limit') limit:number = 10 ,
            @Query('orderBy') orderBy:string  = undefined , 
            @Query('searchQuery') searchQuery:string , 
            @Query('departementId') departementId:string , 
            @Query('directionId') directionId:string,
            @Query("role") role:UserRole = undefined,
            @Query("active") active:"active" | "not_active"
    ):Promise<PaginationResponse<UserEntity>>{

        return await  this.userService.findAll(offset,limit,orderBy,searchQuery,departementId,directionId,active,role);
    }   

    @Get(":id")
    async findById(@Param('id') id:string){
        return await  this.userService.findByIdWithDepartementAndDirection(id);
    }  
    
    // @Delete(':id')
    // async deleteUser(@Param('id') id:string): Promise<string>{
       
    // }
    // @UseGuards(JwtAccessTokenGuard)
    @Put(':id')
    async updateUser(@Param('id') id:string,@Body() user:UpdateUserDTO):Promise<UpdateResult>{
        return await this.userService.updateUserUniqueCheck(id,user)
    }

    @UseGuards(JwtAccessTokenGuard)
    @Patch('recieve-notifications')
    async recieveNotifications(@CurrentUserId() userId:string, @Body('recieve_notifications') recieve_notifications:boolean){
        return await this.userService.recieveNotifications(userId,recieve_notifications);
    }
   
}