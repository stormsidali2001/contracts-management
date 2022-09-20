import {Controller,Post,Get,Param , UploadedFile, BadRequestException, UseInterceptors, ForbiddenException} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express'
import { join } from 'path';
import { imageStorageConfig, isFileExtensionSafe, removeFile } from 'src/shared/utils/image-storage.config';
import { UserService } from '../user.service';
interface ImageUploadResponse{
    filename:string;
}
@Controller('users/image')
export class UserImageController{
    constructor(
        private readonly userService:UserService
    ){}
    @Post('upload')
    @UseInterceptors(FileInterceptor('file',imageStorageConfig))
    async uploadImage(@UploadedFile() file:Express.Multer.File){
        const fileName = file.filename;
        if(!fileName) throw new BadRequestException("file should be a png/jpg");
        const imagesDirectory = join(process.cwd() ,"upload/images");
        const fullImagePath = join(imagesDirectory+"/"+file.filename);
        const safe = await isFileExtensionSafe(fullImagePath);
        if(!safe){
             removeFile(fullImagePath);
             throw new ForbiddenException("file content does not match the extension")
        }
        this.userService.findAndUpdate({})


    }
}