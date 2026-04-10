import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../types/JwtPayload.interface';
import { Tokens } from '../types/tokens.interface';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens(payload: JwtPayload): Promise<Tokens> {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(
        { user: payload },
        {
          secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
          expiresIn: this.configService.get<number>(
            'JWT_ACCESS_TOKEN_EXPIRES_IN',
          ),
        },
      ),
      this.jwtService.signAsync(
        { user: payload },
        {
          secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
          expiresIn: this.configService.get<number>(
            'JWT_REFRESH_TOKEN_EXPIRES_IN',
          ),
        },
      ),
    ]);
    return { access_token, refresh_token };
  }
}
