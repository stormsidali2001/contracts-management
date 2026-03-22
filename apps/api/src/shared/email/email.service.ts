import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {}

  async sendPasswordResetEmail(
    email: string,
    userId: string,
    token: string,
  ): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: this.configService.get('ethereal_user'),
        pass: this.configService.get('ethereal_password'),
      },
    });

    await transporter.sendMail({
      from: '"bmt" <assoulsidali@gmail.com>',
      to: email,
      subject: 'Mot de pasee oublié',
      html: `<b>vous avez envoyer une demmande de réinitialisation de mot de passe.</b><br/> presser sur le lien si il s'agit bien de vous </b><br/> le lien:  http://localhost:3000/reset-password?token=${token}&userId=${userId}`,
    });
  }
}
