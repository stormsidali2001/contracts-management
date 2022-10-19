import { Body, Controller, Get } from "@nestjs/common";
import { StatsParamsDTO } from "./models/statsPramsDTO.interface";
import { StatisticsService } from "./statistics.service";


@Controller('statistics')
export class StatisticsController{
    constructor(
        private readonly statisticsService:StatisticsService
    ){}

    @Get('')
    async getStats({startDate = null,endDate = null}:StatsParamsDTO){
        return await this.statisticsService.getStats(startDate,endDate);
    }

}