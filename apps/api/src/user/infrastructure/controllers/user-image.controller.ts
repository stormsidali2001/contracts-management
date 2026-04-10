import {
  Controller,
  Post,
  Get,
  Param,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Res,
  Put,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Express } from 'express';
import { CurrentUserId } from 'src/auth/decorators/currentUserId.decorator';
import { JwtAccessTokenGuard } from 'src/auth/guards/jwt-access-token.guard';
import { Public } from 'src/auth/decorators/Public.decorator';
import { imageStorageConfig } from 'src/shared/utils/image-storage.config';
import { FileUploadDto } from 'src/user/dto/file-upload.dto';
import { UserService } from '../application/user.service';

interface ImageUploadResponse {
  filename: string;
}

@ApiTags('users/image')
@ApiBearerAuth()
@Controller('users/image')
export class UserImageController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAccessTokenGuard)
  @Put('upload')
  @UseInterceptors(FileInterceptor('file', imageStorageConfig))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'user image', type: FileUploadDto })
  async updateProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUserId() userId: string,
  ): Promise<ImageUploadResponse> {
    const filename = await this.userService.updateImage(userId, file);
    return { filename };
  }

  @UseGuards(JwtAccessTokenGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', imageStorageConfig))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'user image', type: FileUploadDto })
  async uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ImageUploadResponse> {
    const filename = await this.userService.validateImageFile(file);
    return { filename };
  }

  @Public()
  @Get(':fileName')
  findImageByName(@Param('fileName') fileName: string, @Res() res) {
    if (!fileName || ['null', '[null]'].includes(fileName)) return;
    return res.sendFile(fileName, { root: './upload/images' });
  }
}
