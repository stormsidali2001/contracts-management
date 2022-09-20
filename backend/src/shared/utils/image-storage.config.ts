import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { unlinkSync } from "fs";
import { diskStorage } from "multer";
import { extname } from "path";
type ValidFileExtension = 'png' | 'jpg' | 'jpeg';
type ValidMimeType = `image/${ValidFileExtension}`;
import {v4 as uuidv4} from 'uuid';
import {fileTypeFromFile} from 'file-type';

const validExtensions:ValidFileExtension[] = ['png','jpg','jpeg'];
const validMimeTypes:ValidMimeType[] = ['image/png','image/jpg','image/jpeg'];

export const imageStorageConfig:MulterOptions = {
    storage:diskStorage({
        destination:"./upload/images",
        filename:(req,file,cb)=>{
            const fileExtension:string = extname(file.originalname);
            const fileName:string = uuidv4() + fileExtension;
            cb(null,fileName)
        },
    }),
    fileFilter:(req,file,cb)=>{
        validMimeTypes.includes(file.mimetype as ValidMimeType)?cb(null,true):cb(null,false);
    }
}

export const isFileExtensionSafe = async (path):Promise<boolean>=>{
    const fileExtAndMimeType = await fileTypeFromFile(path);

    if(!fileExtAndMimeType) return false;
    const {ext,mime} = fileExtAndMimeType;
    return validExtensions.includes(ext as ValidFileExtension) && validMimeTypes.includes(mime as ValidMimeType) ;
}

export const removeFile = (path):void=>{
    try{
        unlinkSync(path)
    }catch(err){
        console.error(err);
    }
}