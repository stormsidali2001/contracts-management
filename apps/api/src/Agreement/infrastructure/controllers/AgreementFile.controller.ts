import {
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
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/infrastructure/decorators/Public.decorator';
import { JwtAccessTokenGuard } from 'src/auth/infrastructure/guards/jwt-access-token.guard';
import { agreementStorageConfig } from 'src/Agreement/infrastructure/config/agreementStorage.config';
import { FileUploadDto } from 'src/Agreement/infrastructure/types/file-upload.dto';
import { AgreementService } from '../../application/Agreement.service';

interface DocumentUploadResponse {
  filename: string;
}

@ApiTags('agreement documents')
@Controller('agreements/files')
export class AgreementFileController {
  constructor(private readonly agreementService: AgreementService) {}

  @UseGuards(JwtAccessTokenGuard)
  @UseInterceptors(FileInterceptor('file', agreementStorageConfig))
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'agreement document', type: FileUploadDto })
  async uploadAgreement(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<DocumentUploadResponse> {
    const filename = await this.agreementService.validateDocumentFile(file);
    return { filename };
  }

  @Public()
  @Get(':fileName')
  async getAgreement(@Param('fileName') fileName: string, @Res() res) {
    if (!fileName || ['null', '[null]'].includes(fileName)) return;
    return res.sendFile(fileName, { root: './upload/documents' });
  }
}
