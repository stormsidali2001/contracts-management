import { Body, Controller, Get } from "@nestjs/common";
import { StatisticsService } from "./statistics.service";


@Controller('statistics')
export class StatisticsController{
    constructor(
        private readonly statisticsService:StatisticsService
    ){}

    @Get('')
    async getStats(@Body('startDate') startDate:Date, @Body('endDate')endDate:Date){
        return await this.statisticsService.getStats(startDate,endDate);
    }

}