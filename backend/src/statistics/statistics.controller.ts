import { Body, Controller, Get, Query, UseGuards } from "@nestjs/common";
import { CurrentUserId } from "src/auth/decorators/currentUserId.decorator";
import { JwtAccessTokenGuard } from "src/auth/guards/jwt-access-token.guard";
import { StatsParamsDTO } from "./models/statsPramsDTO.interface";
import { StatisticsService } from "./statistics.service";


@Controller('statistics')
export class StatisticsController{
    constructor(
        private readonly statisticsService:StatisticsService
    ){}

    @UseGuards(JwtAccessTokenGuard)
    @Get('')
    async getStats(@Query() params:StatsParamsDTO ,@CurrentUserId() userId:string){

        return await this.statisticsService.getStats(params,userId);
    }

}