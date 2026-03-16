import {Controller,Post,Get,Param , UploadedFile, BadRequestException, UseInterceptors, ForbiddenException, UseGuards, Res, Put} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiProperty, ApiTags } from '@nestjs/swagger';
import { Express } from 'express'
import { join } from 'path';
import { CurrentUserId } from 'src/auth/decorators/currentUserId.decorator';
import { RequiredRoles } from 'src/auth/decorators/RequiredRoles.decorator';
import { JwtAccessTokenGuard } from 'src/auth/guards/jwt-access-token.guard';
import { RoleGuard } from 'src/auth/guards/Role.guard';
import { UserRole } from 'src/core/types/UserRole.enum';
import { imageStorageConfig, isFileExtensionSafe, removeFile } from 'src/shared/utils/image-storage.config';
import { FileUploadDto } from '../dto/file-upload.dto';
import { UserService } from '../user.service';
interface ImageUploadResponse{
    filename:string;
}
@ApiTags('users/image')
@ApiBearerAuth()
@Controller('users/image')
export class UserImageController{
    constructor(
        private readonly userService:UserService
    ){}

    @UseGuards(JwtAccessTokenGuard)
    @Put('upload')
    @UseInterceptors(FileInterceptor('file',imageStorageConfig))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
    description: 'user image',
    type: FileUploadDto,
    })
    async updateProfileImage( @UploadedFile()  file:Express.Multer.File,@CurrentUserId() userId:string):Promise<ImageUploadResponse>{
        try{
            if(!file) throw new BadRequestException("file should be a png/jpg");
            const filename = file.filename;
            const imagesDirectory = join(process.cwd() ,"upload/images");
            const fullImagePath = join(imagesDirectory+"/"+filename);
            const safe = await isFileExtensionSafe(fullImagePath);
            if(!safe){
                 removeFile(fullImagePath);
                 throw new ForbiddenException("file content does not match the extension")
            }
             await this.userService.findAndUpdate(userId,{imageUrl:filename})
            return {filename};

        }catch(err){
            throw err;
        }

    }
    //should be an admin
    @UseGuards(JwtAccessTokenGuard)
    @Post('upload')
    @UseInterceptors(FileInterceptor('file',imageStorageConfig))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
    description: 'user image',
    type: FileUploadDto,
    })
    async uploadProfileImage( @UploadedFile()  file:Express.Multer.File):Promise<ImageUploadResponse>{
        try{
            if(!file) throw new BadRequestException("the file should be a png/jpg");
            const filename = file.filename;
            const imagesDirectory = join(process.cwd() ,"upload/images");
            const fullImagePath = join(imagesDirectory+"/"+filename);
            const isSafe = await isFileExtensionSafe(fullImagePath);
            if(!isSafe){
                 removeFile(fullImagePath);
                 throw new ForbiddenException("file content does not match the extension")
            }
            return {filename};

        }catch(err){
            throw err;
        }

    }
    @Get(":fileName")
    findImageByName(@Param('fileName') fileName:string, @Res() res){
        if(!fileName || ['null','[null]'].includes(fileName)) return;

        return res.sendFile(fileName,{root:'./upload/images'})
    }

}