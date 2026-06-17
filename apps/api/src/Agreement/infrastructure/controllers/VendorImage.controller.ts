import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Express } from 'express';
import { RequiredRoles } from 'src/auth/infrastructure/decorators/RequiredRoles.decorator';
import { JwtAccessTokenGuard } from 'src/auth/infrastructure/guards/jwt-access-token.guard';
import { RoleGuard } from 'src/auth/infrastructure/guards/Role.guard';
import { Public } from 'src/auth/infrastructure/decorators/Public.decorator';
import { imageStorageConfig } from 'src/shared/infrastructure/utils/image-storage.config';
import { FileUploadDto } from 'src/user/infrastructure/dto/file-upload.dto';
import { UserRole } from 'src/core/types/UserRole.enum';

@ApiTags('vendors/image')
@ApiBearerAuth()
@Controller('vendors/image')
export class VendorImageController {
  @RequiredRoles(UserRole.JURIDICAL)
  @UseGuards(JwtAccessTokenGuard, RoleGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', imageStorageConfig))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'vendor logo image', type: FileUploadDto })
  async uploadLogo(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ filename: string }> {
    if (!file) throw new BadRequestException('No file uploaded');
    return { filename: file.filename };
  }

  @Public()
  @Get(':fileName')
  findLogoByName(@Param('fileName') fileName: string, @Res() res) {
    if (!fileName || ['null', '[null]'].includes(fileName)) return;
    return res.sendFile(fileName, { root: './upload/images' });
  }
}
