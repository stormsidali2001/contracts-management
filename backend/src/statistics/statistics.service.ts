import { Injectable } from "@nestjs/common";
import { AgreementService } from "src/Agreement/services/Agreement.service";
import { VendorService } from "src/Agreement/services/vendor.service";
import { UserService } from "src/user/user.service";
import { StatsParamsDTO } from "./models/statsPramsDTO.interface";


@Injectable()
export class StatisticsService{
    constructor(
        private readonly userService:UserService,
        private readonly agreeementService:AgreementService,
        private readonly vendorService:VendorService
    ){}
    async getStats(params:StatsParamsDTO){
        const [userTypes,vendorsStats,agreementsStats]= await Promise.all([
            this.userService.getUserTypesStats(params),
            this.vendorService.getVendorsStats(params),
            this.agreeementService.getAgreementsStats(params)
        ])

        return {
            userTypes,
            vendorsStats,
            agreementsStats
        }
        
    }
}