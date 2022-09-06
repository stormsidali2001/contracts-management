import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "src/user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";


@Module({
    imports:[UserModule,JwtModule.register({})],
    providers:[AuthService],
    controllers:[AuthController]
})
export class AuthModule{}