import { Body, Controller, Get } from "@nestjs/common";
import { StatsParamsDTO } from "./models/statsPramsDTO.interface";
import { StatisticsService } from "./statistics.service";


@Controller('statistics')
export class StatisticsController{
    constructor(
        private readonly statisticsService:StatisticsService
    ){}

    @Get('')
    async getStats(@Body() params:StatsParamsDTO){
        return await this.statisticsService.getStats(params);
    }

}