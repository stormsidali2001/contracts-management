import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "src/core/entities/User.entity";
import { DirectionModule } from "src/direction/direction.module";
import { UserImageController } from "./controllers/user-image.controller";
import { UserController } from "./controllers/user.controller";
import { UserService } from "./user.service";


@Module({
    imports:[TypeOrmModule.forFeature([UserEntity]),DirectionModule],
    controllers:[
        UserController,
        UserImageController
    ],
    providers:[UserService],
    exports:[UserService]
})
export class UserModule{}