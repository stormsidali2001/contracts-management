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
    async getStats(params:StatsParamsDTO,userId:string){
        const user = await this.userService.findBy({id:userId});
        const [userTypes,vendorsStats,agreementsStats]= await Promise.all([
            this.userService.getUserTypesStats(params,user),
            this.vendorService.getVendorsStats(params),
            this.agreeementService.getAgreementsStats(params,user)
        ])

        return {
            userTypes,
            vendorsStats,
            agreementsStats
        }
        
    }
}