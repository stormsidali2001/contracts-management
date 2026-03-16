import { BadRequestException, Controller, ForbiddenException, Get, Param, Post, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { join } from "path";
import {agreementStorageConfig, isFileExtensionSafe, removeFile} from '../config/agreementStorage.config';
import { FileUploadDto } from "../types/file-upload.dto";
interface DocumentUploadResponse{
    filename:string;
}
@ApiTags('agreement documents')
@Controller('agreements/files')
export class AgreementFileController{

    @UseInterceptors(FileInterceptor('file',agreementStorageConfig))
    @Post("upload")
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        description: 'agreement document',
        type: FileUploadDto,
        })
    async uploadAgreement(@UploadedFile() file:Express.Multer.File):Promise<DocumentUploadResponse>{
        try{
            if(!file) throw new BadRequestException("the file should be a pdf");
            const {filename} = file;
            const documentsPath = join(process.cwd(),"upload/documents");
            const fullPath = join(documentsPath+"/"+filename);
            const isSafe = await isFileExtensionSafe(fullPath);
            if(!isSafe){
                removeFile(fullPath);
                throw new ForbiddenException("file content does not match the extension");
            }
            return {filename};
            
        }catch(err){
            throw err;
        }
    }

    @Get(":fileName")
    async getAgreement(@Param("fileName") fileName:string , @Res() res){
        if(!fileName || ['null','[null]'].includes(fileName)) return;

        return res.sendFile(fileName,{root:'./upload/documents'})
    }
}