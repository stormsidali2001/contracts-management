import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "src/user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtAccessTokenGuard } from "./guards/jwt-access-token.guard";
import { JwtRefreshTokenGuard } from "./guards/jwt-refresh-token.guard";
import { JwtAccessTokenStrategy } from "./passport strategies/jwt-access-token.strategy";
import { JwtRefreshTokenStrategy } from "./passport strategies/jwt-refresh-token.strategy";


@Module({
    imports:[UserModule,JwtModule.register({})],
    providers:[AuthService, JwtAccessTokenStrategy,JwtRefreshTokenStrategy,JwtAccessTokenGuard,JwtRefreshTokenGuard],
    controllers:[AuthController]
})
export class AuthModule{}